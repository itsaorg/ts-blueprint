#!/usr/bin/env node

/** ==============================================================
 * 🎫 Issue-before-branch gate
 * ---------------------------------------------------------------
 * Feature and bugfix starts require `<number>-<slug>`. Before
 * `git flow … start`, verify `gh issue view <number>` succeeds.
 * When the issue is missing on a TTY, seed `.git/ISSUE_EDITMSG`
 * from `.github/ISSUE_DRAFT.md`, open the editor, create the
 * issue with `gh`, then refuse start unless the new number
 * matches (so the branch name stays correct). Non-TTY without an
 * existing issue refuses.
 *
 * HOW TO RUN:
 *   imported by feature/start.mjs and bugfix/start.mjs
 *   node .devenv/tools/git-flow/issue-gate.mjs 42-add-login
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Issue gate for feature/bugfix start.
 *
 * @module git-flow-issue-gate
 *
 * @example
 * import { ensureIssueForStart, parseIssueSlug } from "./issue-gate.mjs";
 * await ensureIssueForStart("42-add-login");
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  isInteractive,
  logError,
  logGo,
  logInfo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";
import {
  openDraftInEditor,
  parseIssueDraft,
  resetFileToTemplate,
  seedDraftFromTemplate,
} from "./edit-draft.mjs";

const ISSUE_TEMPLATE = path.join(repoRoot, ".github", "ISSUE_DRAFT.md");
const ISSUE_EDITMSG = path.join(repoRoot, ".git", "ISSUE_EDITMSG");

/**
 * Parses `<number>-<slug>` from a feature/bugfix short name.
 *
 * @param {string} name - Short name without `type/` prefix.
 * @returns {{ number: string, slug: string } | null} Parsed pieces, or null.
 *
 * @example
 * parseIssueSlug("42-add-login"); // { number: "42", slug: "add-login" }
 * parseIssueSlug("add-login");    // null
 */
export function parseIssueSlug(name) {
  const match = String(name ?? "").match(/^(\d+)-(.+)$/);
  if (!match) {
    return null;
  }
  return { number: match[1], slug: match[2] };
}

/**
 * Whether `gh` can view the given issue number.
 *
 * @param {string} number - Issue digits.
 * @returns {boolean} True when the issue exists and is readable.
 *
 * @example
 * issueExists("42");
 */
export function issueExists(number) {
  try {
    run(`gh issue view ${JSON.stringify(String(number))} --json number`, { inherit: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a GitHub issue from the edited `.git/ISSUE_EDITMSG` draft.
 *
 * @param {string} expectedNumber - Number the branch name claims.
 * @param {string} slug - Slug hint for logs.
 * @returns {{ ok: boolean, number?: string }} Outcome with created number when ok.
 *
 * @example
 * await createIssueFromDraft("42", "add-login");
 */
export async function createIssueFromDraft(expectedNumber, slug) {
  const seeded = seedDraftFromTemplate(ISSUE_EDITMSG, ISSUE_TEMPLATE, (text) => {
    const hint = slug.replace(/-/g, " ");
    return text.replace(/^# Short title for the issue\s*$/m, `# ${hint}`);
  });
  if (!seeded.ok) {
    return { ok: false };
  }

  if (!isInteractive()) {
    logError(`Issue #${expectedNumber} does not exist.`);
    logInfo("Create it on GitHub first, or re-run start in an interactive terminal.");
    resetFileToTemplate(ISSUE_EDITMSG, ISSUE_TEMPLATE);
    return { ok: false };
  }

  logInfo(`Issue #${expectedNumber} not found — draft it in the editor, then save and close.`);
  if (!openDraftInEditor(ISSUE_EDITMSG).ok) {
    resetFileToTemplate(ISSUE_EDITMSG, ISSUE_TEMPLATE);
    return { ok: false };
  }

  let raw;
  try {
    raw = readFileSync(ISSUE_EDITMSG, "utf8");
  } catch (error) {
    logError(`Could not read issue draft: ${error instanceof Error ? error.message : error}`);
    return { ok: false };
  }

  const { title, body } = parseIssueDraft(raw);
  if (!title || title === "Short title for the issue") {
    logError("Issue draft needs a real `# Title` line (not the stub).");
    resetFileToTemplate(ISSUE_EDITMSG, ISSUE_TEMPLATE);
    return { ok: false };
  }
  if (!body.trim()) {
    logError("Issue draft body is empty after the title.");
    resetFileToTemplate(ISSUE_EDITMSG, ISSUE_TEMPLATE);
    return { ok: false };
  }

  logGo(`gh issue create --title ${JSON.stringify(title)}`);
  const result = spawnSync("gh", ["issue", "create", "--title", title, "--body", body], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  if ((result.status ?? 1) !== 0) {
    logError("gh issue create failed");
    resetFileToTemplate(ISSUE_EDITMSG, ISSUE_TEMPLATE);
    return { ok: false };
  }

  const out = String(result.stdout ?? "").trim();
  const urlMatch = out.match(/\/issues\/(\d+)\s*$/m) || out.match(/\/issues\/(\d+)/);
  const createdNumber = urlMatch ? urlMatch[1] : null;
  resetFileToTemplate(ISSUE_EDITMSG, ISSUE_TEMPLATE);

  if (!createdNumber) {
    logError("Created an issue but could not parse its number from gh output.");
    logInfo(out || "(empty stdout)");
    return { ok: false };
  }

  if (createdNumber !== String(expectedNumber)) {
    logError(`Created issue #${createdNumber}, but the branch name expects #${expectedNumber}.`);
    logInfo(`Re-run start with: ${createdNumber}-${slug}`);
    return { ok: false, number: createdNumber };
  }

  logOk(`Created and verified issue #${createdNumber}.`);
  return { ok: true, number: createdNumber };
}

/**
 * Ensures the issue for a feature/bugfix short name exists (or is created).
 *
 * @param {string} shortName - `<number>-<slug>`.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * if (!(await ensureIssueForStart("42-add-login")).ok) return { ok: false };
 */
export async function ensureIssueForStart(shortName) {
  const parsed = parseIssueSlug(shortName);
  if (!parsed) {
    logError('Pass <number>-<slug> (for example "42-add-login").');
    return { ok: false };
  }

  try {
    run("gh auth status", { inherit: false });
  } catch {
    logError("gh is not authenticated; cannot verify the issue before start.");
    logInfo("Run: npm run gh:auth:login");
    return { ok: false };
  }

  if (issueExists(parsed.number)) {
    logOk(`Issue #${parsed.number} exists — starting branch.`);
    return { ok: true };
  }

  logSkip(`Issue #${parsed.number} not found.`);
  return createIssueFromDraft(parsed.number, parsed.slug);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🎫 issue-gate");
  const name = forwardedArgs()[0];
  if (!name) {
    logError("Pass <number>-<slug>.");
    process.exit(1);
  }
  const result = await ensureIssueForStart(name);
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("issue-gate");
}
