#!/usr/bin/env node

/** ==============================================================
 * ✏️ Editor draft helper
 * ---------------------------------------------------------------
 * Shared helpers for COMMIT_EDITMSG-style drafts under `.git/`:
 * resolve the user's editor, open a file in it, decide whether a
 * PR `## Summary` section is filled, and reset a draft file back
 * to a tracked template. Used by issue-gate and publish-flow.
 *
 * HOW TO RUN:
 *   imported by git-flow issue-gate / publish-flow
 *   node .devenv/tools/git-flow/edit-draft.mjs --check-summary <file>
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Editor draft helpers for Git Flow issue and PR flows.
 *
 * @module git-flow-edit-draft
 *
 * @example
 * import { resolveEditor, summaryIsFilled } from "./edit-draft.mjs";
 * summaryIsFilled("## Summary\n\nReal text.\n");
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logInfo,
  logOk,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";

/**
 * Resolves the editor command (git core.editor, then env vars).
 *
 * @returns {string | null} Editor command string, or null when unset.
 *
 * @example
 * resolveEditor(); // "code --wait" or "vim"
 */
export function resolveEditor() {
  try {
    const fromGit = run("git config --get core.editor", { inherit: false }).trim();
    if (fromGit) {
      return fromGit;
    }
  } catch {
    // no core.editor
  }
  const fromEnv = process.env.GIT_EDITOR || process.env.VISUAL || process.env.EDITOR;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim();
  }
  return null;
}

/**
 * Opens a draft file in the resolved editor (blocking).
 *
 * Uses `shell: true` so commands like `code --wait` work on Windows.
 *
 * @param {string} filePath - Absolute path to the draft file.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * openDraftInEditor(path.join(repoRoot, ".git", "PR_EDITMSG"));
 */
export function openDraftInEditor(filePath) {
  const editor = resolveEditor();
  if (!editor) {
    logError("No editor configured (git core.editor, GIT_EDITOR, VISUAL, or EDITOR).");
    logInfo("Set one, or pass --body-file <path> for non-interactive publish.");
    return { ok: false };
  }
  const abs = path.resolve(filePath);
  logInfo(`Opening draft in editor: ${editor}`);
  const quoted = `"${abs.replace(/"/g, '\\"')}"`;
  const result = spawnSync(`${editor} ${quoted}`, {
    cwd: repoRoot,
    shell: true,
    stdio: "inherit",
  });
  if ((result.status ?? 1) !== 0) {
    logError("Editor exited with a non-zero status.");
    return { ok: false };
  }
  return { ok: true };
}

/**
 * Whether the `## Summary` section has a non-comment, non-empty line.
 *
 * @param {string} markdown - Full PR body markdown.
 * @returns {boolean} True when Summary has real text.
 *
 * @example
 * summaryIsFilled("## Summary\n\n<!-- Why -->\n"); // false
 * summaryIsFilled("## Summary\n\nShip the gate.\n"); // true
 */
export function summaryIsFilled(markdown) {
  const text = String(markdown ?? "");
  const match = text.match(/^## Summary\s*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  if (!match) {
    return false;
  }
  const section = match[1];
  let inBlockComment = false;
  for (const line of section.split(/\r?\n/)) {
    let rest = line;
    if (inBlockComment) {
      const end = rest.indexOf("-->");
      if (end === -1) {
        continue;
      }
      rest = rest.slice(end + 3);
      inBlockComment = false;
    }
    while (rest.includes("<!--")) {
      const start = rest.indexOf("<!--");
      const before = rest.slice(0, start);
      if (before.trim()) {
        return true;
      }
      const end = rest.indexOf("-->", start + 4);
      if (end === -1) {
        inBlockComment = true;
        rest = "";
        break;
      }
      rest = rest.slice(end + 3);
    }
    if (rest.trim()) {
      return true;
    }
  }
  return false;
}

/**
 * Writes `templatePath` contents onto `dest` (creates parent dirs).
 *
 * @param {string} dest - Destination draft path.
 * @param {string} templatePath - Tracked template to copy from.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * resetFileToTemplate(".git/PR_EDITMSG", ".github/PULL_REQUEST_TEMPLATE/pull_request_template.md");
 */
export function resetFileToTemplate(dest, templatePath) {
  try {
    const absDest = path.resolve(dest);
    const absTemplate = path.resolve(templatePath);
    mkdirSync(path.dirname(absDest), { recursive: true });
    copyFileSync(absTemplate, absDest);
    return { ok: true };
  } catch (error) {
    logError(
      `Could not reset draft to template: ${error instanceof Error ? error.message : error}`,
    );
    return { ok: false };
  }
}

/**
 * Seeds a draft file from a template, optionally rewriting contents.
 *
 * @param {string} dest - Destination draft path.
 * @param {string} templatePath - Tracked template path.
 * @param {(text: string) => string} [transform] - Optional rewrite after read.
 * @returns {{ ok: boolean, path?: string }} Outcome.
 *
 * @example
 * seedDraftFromTemplate(dest, template, (t) => t.replace(/^Closes #$/m, "Closes #42"));
 */
export function seedDraftFromTemplate(dest, templatePath, transform) {
  try {
    const absDest = path.resolve(dest);
    const absTemplate = path.resolve(templatePath);
    mkdirSync(path.dirname(absDest), { recursive: true });
    let text = readFileSync(absTemplate, "utf8");
    if (typeof transform === "function") {
      text = transform(text);
    }
    writeFileSync(absDest, text, "utf8");
    return { ok: true, path: absDest };
  } catch (error) {
    logError(`Could not seed draft: ${error instanceof Error ? error.message : error}`);
    return { ok: false };
  }
}

/**
 * Injects `Closes #<n>` into a PR template body when the line is bare.
 *
 * @param {string} template - PR template markdown.
 * @param {string | null | undefined} issueNumber - Digits from the branch name.
 * @returns {string} Possibly rewritten body.
 *
 * @example
 * injectClosesIssue("Closes #\n", "42"); // "Closes #42\n"
 */
export function injectClosesIssue(template, issueNumber) {
  if (!issueNumber) {
    return template;
  }
  return String(template).replace(/^Closes #$/m, `Closes #${issueNumber}`);
}

/**
 * First `# …` markdown title line, or null.
 *
 * @param {string} markdown - Draft markdown.
 * @returns {string | null} Title text without the leading `#`.
 *
 * @example
 * parseMarkdownTitle("# Fix login\n\nBody"); // "Fix login"
 */
export function parseMarkdownTitle(markdown) {
  for (const line of String(markdown ?? "").split(/\r?\n/)) {
    const match = line.match(/^#\s+(.+?)\s*$/);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Splits an issue draft into title (first `#` line) and remaining body.
 *
 * @param {string} markdown - Issue draft markdown.
 * @returns {{ title: string, body: string }} Parsed pieces (title may be empty).
 *
 * @example
 * parseIssueDraft("# Add export\n\nShip CSV.");
 */
export function parseIssueDraft(markdown) {
  const lines = String(markdown ?? "").split(/\r?\n/);
  let title = "";
  let titleIndex = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^#\s+(.+?)\s*$/);
    if (match) {
      title = match[1].trim();
      titleIndex = i;
      break;
    }
  }
  const body =
    titleIndex === -1
      ? String(markdown ?? "").trim()
      : lines
          .slice(titleIndex + 1)
          .join("\n")
          .trim();
  return { title, body };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("✏️ edit-draft");
  const args = forwardedArgs();
  if (args[0] === "--check-summary" && args[1]) {
    const text = readFileSync(path.resolve(args[1]), "utf8");
    if (summaryIsFilled(text)) {
      logOk("Summary is filled.");
      boxDone("edit-draft");
      process.exit(0);
    }
    logError("Summary is empty or only HTML comments.");
    process.exit(1);
  }
  logError("Usage: node .devenv/tools/git-flow/edit-draft.mjs --check-summary <file>");
  process.exit(1);
}
