#!/usr/bin/env node

/** ==============================================================
 * 🚪 Git Flow start gates
 * ---------------------------------------------------------------
 * Shared preflight for every branch type start: clean working
 * tree, on a fully synced base branch, plus `.git/CURRENT_ISSUE`
 * helpers so release/hotfix/support can seed `Closes #N` on
 * publish when the branch name is not `<number>-<slug>`.
 *
 * HOW TO RUN:
 *   imported by type start.mjs modules
 *   node .devenv/tools/git-flow/utils/start-gates.mjs --check-base develop
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Start preflight and CURRENT_ISSUE helpers.
 *
 * @module git-flow-start-gates
 *
 * @example
 * import { requireCleanSyncedBase, writeCurrentIssue } from "./start-gates.mjs";
 * await requireCleanSyncedBase("develop");
 */

import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
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
} from "../../../lib/tool-lib.mjs";
import { headBranch } from "./gates/headBranch.mjs";
import { isOnBranch } from "./gates/isOnBranch.mjs";
import { isSyncedWithOrigin } from "./gates/isSyncedWithOrigin.mjs";
import { isWorkingTreeClean } from "./gates/isWorkingTreeClean.mjs";
import { issueExists, parseIssueSlug, resolveIssueBranchName } from "./issue-gate.mjs";

export { isWorkingTreeClean } from "./gates/isWorkingTreeClean.mjs";
export { parseAheadBehind } from "./gates/parseAheadBehind.mjs";

const CURRENT_ISSUE_PATH = path.join(repoRoot, ".git", "CURRENT_ISSUE");

/**
 * Path to the local CURRENT_ISSUE marker file.
 *
 * @returns {string} Absolute path under `.git/`.
 */
export function currentIssuePath() {
  return CURRENT_ISSUE_PATH;
}

/**
 * Requires a clean working tree.
 *
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * if (!requireCleanWorkingTree().ok) return { ok: false };
 */
export function requireCleanWorkingTree() {
  if (!isWorkingTreeClean()) {
    logError("Working tree is not clean. Commit or stash before start/finish.");
    return { ok: false };
  }
  logOk("Working tree is clean.");
  return { ok: true };
}

/**
 * Merge strategy for finish by Git Flow type.
 *
 * @param {"feature" | "bugfix" | "release" | "hotfix" | "support"} type - Branch type.
 * @returns {"squash" | "merge"} gh pr merge flag family.
 *
 * @example
 * mergeStrategyFor("feature"); // "squash"
 * mergeStrategyFor("release"); // "merge"
 */
export function mergeStrategyFor(type) {
  if (type === "feature" || type === "bugfix") {
    return "squash";
  }
  return "merge";
}

/**
 * Requires checkout of `base`, fetch, and no ahead/behind vs origin/base.
 *
 * @param {string} base - Base branch name (`develop`, `main`, …).
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * requireCleanSyncedBase("develop");
 */
export function requireCleanSyncedBase(base) {
  if (!requireCleanWorkingTree().ok) {
    return { ok: false };
  }

  const branch = headBranch();
  if (!branch) {
    logError("Could not determine current branch.");
    return { ok: false };
  }
  if (!isOnBranch(base)) {
    logError(`Start must run from ${base} (currently on ${branch}).`);
    logInfo(`git checkout ${base}`);
    return { ok: false };
  }

  try {
    run("git fetch origin", { inherit: false });
  } catch {
    logError("git fetch origin failed.");
    return { ok: false };
  }

  if (!isSyncedWithOrigin(base)) {
    logError(`${base} is not fully synced with origin/${base}.`);
    logInfo(`git pull origin ${base}`);
    return { ok: false };
  }

  logOk(`${base} is clean and synced with origin/${base}.`);
  return { ok: true };
}

/**
 * Writes the linked issue number for publish/finish.
 *
 * @param {string} number - Issue digits.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * writeCurrentIssue("42");
 */
export function writeCurrentIssue(number) {
  const digits = String(number ?? "").trim();
  if (!/^\d+$/.test(digits)) {
    logError("CURRENT_ISSUE requires numeric issue digits.");
    return { ok: false };
  }
  try {
    writeFileSync(CURRENT_ISSUE_PATH, `${digits}\n`, "utf8");
    logOk(`Recorded .git/CURRENT_ISSUE → #${digits}`);
    return { ok: true };
  } catch (error) {
    logError(`Could not write CURRENT_ISSUE: ${error instanceof Error ? error.message : error}`);
    return { ok: false };
  }
}

/**
 * Reads `.git/CURRENT_ISSUE` digits, or null.
 *
 * @returns {string | null} Issue number, or null.
 *
 * @example
 * readCurrentIssue(); // "42"
 */
export function readCurrentIssue() {
  try {
    if (!existsSync(CURRENT_ISSUE_PATH)) {
      return null;
    }
    const raw = readFileSync(CURRENT_ISSUE_PATH, "utf8").trim();
    return /^\d+$/.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Deletes `.git/CURRENT_ISSUE` if present.
 *
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * clearCurrentIssue();
 */
export function clearCurrentIssue() {
  try {
    if (existsSync(CURRENT_ISSUE_PATH)) {
      unlinkSync(CURRENT_ISSUE_PATH);
      logInfo("Cleared .git/CURRENT_ISSUE.");
    }
    return { ok: true };
  } catch (error) {
    logError(`Could not clear CURRENT_ISSUE: ${error instanceof Error ? error.message : error}`);
    return { ok: false };
  }
}

/**
 * Resolves a linked issue number (picker / create / `--issue` / number-slug).
 *
 * @param {{ issueFlag?: string, numberSlug?: string, gitFlowType?: string }} [options] - Explicit issue sources.
 * @returns {Promise<{ ok: boolean, number?: string, name?: string }>} Outcome.
 *
 * @example
 * await resolveLinkedIssue({ issueFlag: "42" });
 * await resolveLinkedIssue({ gitFlowType: "release" }); // interactive picker
 */
export async function resolveLinkedIssue(options = {}) {
  const issueOptions = { gitFlowType: options.gitFlowType };

  if (options.issueFlag) {
    const digits = String(options.issueFlag).replace(/^#/, "");
    if (!/^\d+$/.test(digits)) {
      logError("Pass --issue <number>.");
      return { ok: false };
    }
    try {
      run("gh auth status", { inherit: false });
    } catch {
      logError("gh is not authenticated; cannot verify the issue before start.");
      return { ok: false };
    }
    if (!issueExists(digits)) {
      logError(`Issue #${digits} does not exist.`);
      return { ok: false };
    }
    logOk(`Issue #${digits} exists.`);
    return { ok: true, number: digits };
  }

  if (options.numberSlug) {
    const resolved = await resolveIssueBranchName([options.numberSlug], issueOptions);
    if (!resolved.ok || !resolved.name) {
      return { ok: false };
    }
    const parsed = parseIssueSlug(resolved.name);
    return { ok: true, number: parsed?.number, name: resolved.name };
  }

  const resolved = await resolveIssueBranchName([], issueOptions);
  if (!resolved.ok || !resolved.name) {
    return { ok: false };
  }
  const parsed = parseIssueSlug(resolved.name);
  return { ok: true, number: parsed?.number, name: resolved.name };
}

/**
 * Splits `--issue <n>` from start argv.
 *
 * @param {string[]} args - CLI args.
 * @returns {{ issueFlag?: string, rest: string[] }} Parsed pieces.
 *
 * @example
 * parseIssueFlagArgs(["--issue", "42", "1.2.0"]);
 */
export function parseIssueFlagArgs(args) {
  /** @type {string | undefined} */
  let issueFlag;
  const rest = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--issue") {
      issueFlag = args[i + 1];
      i += 1;
      continue;
    }
    rest.push(args[i]);
  }
  return { issueFlag, rest };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 start-gates");
  const args = forwardedArgs();
  if (args[0] === "--check-base" && args[1]) {
    if (!requireCleanSyncedBase(args[1]).ok) {
      process.exit(1);
    }
    boxDone("start-gates");
    process.exit(0);
  }
  logError("Usage: node .devenv/tools/git-flow/utils/start-gates.mjs --check-base <branch>");
  process.exit(1);
}
