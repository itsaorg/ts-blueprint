#!/usr/bin/env node

/** ==============================================================
 * 🎫 Issue-before-branch gate
 * ---------------------------------------------------------------
 * Feature and bugfix starts resolve a GitHub issue first, then
 * return `<number>-<slug>` for `git flow … start`. With no args on
 * a TTY: list open issues and let the user pick, or create a new
 * issue by seeding `.git/ISSUE_EDITMSG` from a YAML issue form
 * (feature / bug / chore), opening the editor, and creating after
 * the editor exits. Power path: pass `<number>-<slug>` to verify
 * an existing issue. Drafts live under `.git/` like COMMIT_EDITMSG.
 *
 * HOW TO RUN:
 *   imported by feature/start.mjs and bugfix/start.mjs
 *   node .devenv/tools/git-flow/issue-gate.mjs
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
 * import { resolveIssueBranchName } from "./issue-gate.mjs";
 * const resolved = await resolveIssueBranchName([]);
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
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
import { openDraftInEditor, parseIssueDraft, resetFileToTemplate } from "./edit-draft.mjs";

const ISSUE_DRAFT_STUB = path.join(repoRoot, ".github", "ISSUE_DRAFT.md");
const ISSUE_EDITMSG = path.join(repoRoot, ".git", "ISSUE_EDITMSG");
const ISSUE_TEMPLATE_DIR = path.join(repoRoot, ".github", "ISSUE_TEMPLATE");

/** @type {{ key: string, file: string, chooser: string }[]} */
export const ISSUE_FORM_CHOICES = [
  { key: "feature", file: "feature_request.yml", chooser: "Feature request" },
  { key: "bug", file: "bug_report.yml", chooser: "Bug report" },
  { key: "chore", file: "chore_docs.yml", chooser: "Chore or docs" },
];

/**
 * Parses `<number>-<slug>` from a feature/bugfix short name.
 *
 * @param {string} name - Short name without `type/` prefix.
 * @returns {{ number: string, slug: string } | null} Parsed pieces, or null.
 *
 * @example
 * parseIssueSlug("42-add-login"); // { number: "42", slug: "add-login" }
 */
export function parseIssueSlug(name) {
  const match = String(name ?? "").match(/^(\d+)-(.+)$/);
  if (!match) {
    return null;
  }
  return { number: match[1], slug: match[2] };
}

/**
 * Builds a kebab-case slug from an issue title (max ~40 chars).
 *
 * @param {string} title - Issue title.
 * @returns {string} Non-empty slug.
 *
 * @example
 * slugifyIssueTitle("✨ FEAT: Add login"); // "feat-add-login"
 */
export function slugifyIssueTitle(title) {
  const slug = String(title ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40)
    .replace(/-+$/g, "");
  return slug || "issue";
}

/**
 * Light parse of a GitHub issue-form YAML for seeding a draft.
 *
 * @param {string} text - YAML file contents.
 * @returns {{ title: string, labels: string[], fieldLabels: string[] }} Form meta.
 *
 * @example
 * parseIssueFormYaml('title: "✨ FEAT: <slug>"\nlabels: ["✨ Feature Request"]\n');
 */
export function parseIssueFormYaml(text) {
  const raw = String(text ?? "");
  const titleMatch = raw.match(/^title:\s*"([^"]*)"/m) || raw.match(/^title:\s*'([^']*)'/m);
  /** @type {string[]} */
  const labels = [];
  const labelsBlock = raw.match(/^labels:\s*\[([^\]]*)\]/m);
  if (labelsBlock) {
    for (const match of labelsBlock[1].matchAll(/"([^"]+)"|'([^']+)'/g)) {
      labels.push(match[1] || match[2]);
    }
  }
  /** @type {string[]} */
  const fieldLabels = [];
  const lines = raw.split(/\r?\n/);
  let wantLabel = false;
  for (const line of lines) {
    if (/^\s+- type:\s*(textarea|input)\s*$/.test(line)) {
      wantLabel = true;
      continue;
    }
    if (!wantLabel) {
      continue;
    }
    const quoted = line.match(/^\s+label:\s*"([^"]*)"/) || line.match(/^\s+label:\s*'([^']*)'/);
    const bare = line.match(/^\s+label:\s*(.+?)\s*$/);
    if (quoted) {
      fieldLabels.push(quoted[1]);
      wantLabel = false;
      continue;
    }
    if (bare && !bare[1].startsWith("&") && !bare[1].startsWith("*")) {
      fieldLabels.push(bare[1].replace(/^["']|["']$/g, ""));
      wantLabel = false;
    }
    if (/^\s+- type:/.test(line)) {
      wantLabel = /textarea|input/.test(line);
    }
  }
  return {
    title: titleMatch ? titleMatch[1] : "Issue title",
    labels,
    fieldLabels,
  };
}

/**
 * Builds ISSUE_EDITMSG markdown from issue-form meta.
 *
 * @param {{ title: string, fieldLabels: string[] }} meta - Parsed form meta.
 * @returns {string} Draft markdown.
 *
 * @example
 * seedIssueDraftFromFormMeta({ title: "✨ FEAT: <slug>", fieldLabels: ["Problem"] });
 */
export function seedIssueDraftFromFormMeta(meta) {
  const lines = [
    `# ${meta.title}`,
    "",
    "<!-- Replace <slug> in the title. Fill each section below. HTML comments are ignored. -->",
    "",
  ];
  for (const label of meta.fieldLabels) {
    lines.push(`## ${label}`, "", "", "");
  }
  if (meta.fieldLabels.length === 0) {
    lines.push("## Description", "", "", "");
  }
  return lines.join("\n");
}

/**
 * Whether `gh` can view the given issue number.
 *
 * @param {string} number - Issue digits.
 * @returns {boolean} True when the issue exists.
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
 * Lists open issues via `gh`.
 *
 * @returns {{ number: number, title: string, labels: { name: string }[] }[]} Open issues.
 *
 * @example
 * listOpenIssues();
 */
export function listOpenIssues() {
  try {
    const raw = run(`gh issue list --state open --limit 30 --json number,title,labels`, {
      inherit: false,
    });
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Asks for a single line on a TTY.
 *
 * @param {string} label - Prompt label.
 * @param {string} [defaultValue=""] - Value on Enter.
 * @returns {Promise<string>} Trimmed answer.
 */
async function askLine(label, defaultValue = "") {
  const hint = defaultValue ? ` [${defaultValue}]` : "";
  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question(`❓ ${label}${hint}: `)).trim();
    return answer || defaultValue;
  } finally {
    rl.close();
  }
}

/**
 * Ensures `gh` is authenticated.
 *
 * @returns {boolean} True when ready.
 */
function ghReady() {
  try {
    run("gh auth status", { inherit: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates an issue from the current ISSUE_EDITMSG contents and labels.
 *
 * @param {string[]} labels - Labels from the chosen form.
 * @returns {{ ok: boolean, number?: string, title?: string, name?: string }} Outcome.
 */
function createIssueFromEditmsg(labels) {
  let raw;
  try {
    raw = readFileSync(ISSUE_EDITMSG, "utf8");
  } catch (error) {
    logError(`Could not read issue draft: ${error instanceof Error ? error.message : error}`);
    return { ok: false };
  }

  const { title, body } = parseIssueDraft(raw);
  if (!title || /<slug>/i.test(title) || title === "Short title for the issue") {
    logError("Issue draft needs a real `# Title` line (replace <slug>).");
    return { ok: false };
  }
  if (!body.trim()) {
    logError("Issue draft body is empty after the title.");
    return { ok: false };
  }

  writeFileSync(ISSUE_EDITMSG, `${body}\n`, "utf8");
  const args = ["issue", "create", "--title", title, "--body-file", ISSUE_EDITMSG];
  for (const label of labels) {
    args.push("--label", label);
  }
  logGo(`gh issue create --title ${JSON.stringify(title)}`);
  const result = spawnSync("gh", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  if ((result.status ?? 1) !== 0) {
    logError("gh issue create failed");
    return { ok: false };
  }

  const out = String(result.stdout ?? "").trim();
  const urlMatch = out.match(/\/issues\/(\d+)/);
  const createdNumber = urlMatch ? urlMatch[1] : null;
  resetFileToTemplate(ISSUE_EDITMSG, ISSUE_DRAFT_STUB);

  if (!createdNumber) {
    logError("Created an issue but could not parse its number from gh output.");
    logInfo(out || "(empty stdout)");
    return { ok: false };
  }

  const slug = slugifyIssueTitle(title);
  const name = `${createdNumber}-${slug}`;
  logOk(`Created issue #${createdNumber} → branch name ${name}`);
  return { ok: true, number: createdNumber, title, name };
}

/**
 * Interactive create: pick form → seed ISSUE_EDITMSG → editor → gh create.
 *
 * @returns {Promise<{ ok: boolean, name?: string }>} Outcome with resolved branch name.
 */
export async function createIssueInteractively() {
  logInfo("Choose an issue form to seed the draft:");
  ISSUE_FORM_CHOICES.forEach((choice, index) => {
    logInfo(`${index + 1}. ${choice.chooser}`);
  });
  const picked = await askLine("Form number", "1");
  const index = Number(picked) - 1;
  const choice = ISSUE_FORM_CHOICES[index];
  if (!choice) {
    logError("Invalid form choice.");
    return { ok: false };
  }

  const yamlPath = path.join(ISSUE_TEMPLATE_DIR, choice.file);
  let yamlText;
  try {
    yamlText = readFileSync(yamlPath, "utf8");
  } catch (error) {
    logError(`Could not read ${choice.file}: ${error instanceof Error ? error.message : error}`);
    return { ok: false };
  }

  const meta = parseIssueFormYaml(yamlText);
  const draft = seedIssueDraftFromFormMeta(meta);
  try {
    writeFileSync(ISSUE_EDITMSG, draft, "utf8");
  } catch (error) {
    logError(`Could not write ISSUE_EDITMSG: ${error instanceof Error ? error.message : error}`);
    return { ok: false };
  }

  logInfo("Edit the issue in your editor, then save and close to continue create.");
  if (!openDraftInEditor(ISSUE_EDITMSG).ok) {
    resetFileToTemplate(ISSUE_EDITMSG, ISSUE_DRAFT_STUB);
    return { ok: false };
  }

  return createIssueFromEditmsg(meta.labels);
}

/**
 * Interactive picker over open issues, or create.
 *
 * @returns {Promise<{ ok: boolean, name?: string }>} Resolved `<number>-<slug>`.
 */
export async function pickOrCreateIssueBranchName() {
  const issues = listOpenIssues();
  if (issues.length === 0) {
    logSkip("No open issues — creating a new one.");
    return createIssueInteractively();
  }

  logInfo("Open issues:");
  issues.forEach((issue, index) => {
    const labelNames = Array.isArray(issue.labels)
      ? issue.labels.map((label) => label.name).join(", ")
      : "";
    const suffix = labelNames ? ` [${labelNames}]` : "";
    logInfo(`${index + 1}. #${issue.number} ${issue.title}${suffix}`);
  });
  logInfo("0. Create new issue");

  const answer = (await askLine("Pick an issue number, or 0 to create", "")).toLowerCase();
  if (answer === "0" || answer === "c" || answer === "create") {
    return createIssueInteractively();
  }

  const asIndex = Number(answer);
  if (Number.isInteger(asIndex) && asIndex >= 1 && asIndex <= issues.length) {
    const issue = issues[asIndex - 1];
    const slug = slugifyIssueTitle(issue.title);
    const name = `${issue.number}-${slug}`;
    logOk(`Using #${issue.number} → ${name}`);
    return { ok: true, name };
  }

  if (/^\d+$/.test(answer)) {
    const issue = issues.find((row) => String(row.number) === answer);
    if (issue) {
      const slug = slugifyIssueTitle(issue.title);
      const name = `${issue.number}-${slug}`;
      logOk(`Using #${issue.number} → ${name}`);
      return { ok: true, name };
    }
  }

  logError("Invalid choice.");
  return { ok: false };
}

/**
 * Resolves `<number>-<slug>` for feature/bugfix start.
 *
 * @param {string[]} [args] - Optional `[ "<number>-<slug>" ]`.
 * @returns {Promise<{ ok: boolean, name?: string }>} Outcome.
 *
 * @example
 * await resolveIssueBranchName([]);
 * await resolveIssueBranchName(["42-add-login"]);
 */
export async function resolveIssueBranchName(args = []) {
  if (!ghReady()) {
    logError("gh is not authenticated; cannot resolve an issue before start.");
    logInfo("Run: npm run gh:auth:login");
    return { ok: false };
  }

  const explicit = args[0];
  if (explicit) {
    const parsed = parseIssueSlug(explicit);
    if (!parsed) {
      logError(
        'Pass <number>-<slug> (for example "42-add-login"), or omit args to pick interactively.',
      );
      return { ok: false };
    }
    if (!issueExists(parsed.number)) {
      logError(`Issue #${parsed.number} does not exist.`);
      logInfo("Omit the name and run interactively to create an issue, then start.");
      return { ok: false };
    }
    logOk(`Issue #${parsed.number} exists — starting ${explicit}.`);
    return { ok: true, name: explicit };
  }

  if (!isInteractive()) {
    logError("Non-interactive start requires <number>-<slug>.");
    return { ok: false };
  }

  return pickOrCreateIssueBranchName();
}

/**
 * @deprecated Use resolveIssueBranchName. Kept for call-site compatibility.
 * @param {string} shortName - `<number>-<slug>`.
 * @returns {Promise<{ ok: boolean, name?: string }>} Outcome.
 */
export async function ensureIssueForStart(shortName) {
  return resolveIssueBranchName(shortName ? [shortName] : []);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🎫 issue-gate");
  const result = await resolveIssueBranchName(forwardedArgs());
  if (!result.ok) {
    process.exit(1);
  }
  logInfo(`Resolved branch name: ${result.name}`);
  boxDone("issue-gate");
}
