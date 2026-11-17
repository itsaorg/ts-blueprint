#!/usr/bin/env node

/** ==============================================================
 * 🚪 Shared Git Flow boolean gates
 * ---------------------------------------------------------------
 * Pure HEAD / working-tree / remote checks any start, publish, or
 * finish script can call without duplicating git probes. Logging
 * and exit stay in the caller (or thin require* wrappers).
 *
 * HOW TO RUN:
 *   imported by git-flow utils modules
 *   node .devenv/tools/git-flow/utils/gates.mjs --show-head
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Boolean gates for Git Flow scripts.
 *
 * @module git-flow-gates
 *
 * @example
 * import { isOnTypeBranch, isWorkingTreeClean } from "./gates.mjs";
 * if (!isOnTypeBranch("feature")) process.exit(1);
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logInfo,
  repoRoot,
  run,
} from "../../../lib/tool-lib.mjs";

/**
 * @typedef {"feature" | "bugfix" | "release" | "hotfix" | "support"} GitFlowType
 */

/**
 * Current HEAD branch name (`git branch --show-current`).
 *
 * @returns {string} Branch name, or empty string.
 *
 * @example
 * headBranch(); // "feature/42-add-login"
 */
export function headBranch() {
  try {
    return run("git branch --show-current", { inherit: false });
  } catch {
    return "";
  }
}

/**
 * Whether `branch` matches the Git Flow type prefix.
 *
 * @param {string} branch - Full branch name.
 * @param {GitFlowType | string} type - Type prefix without slash.
 * @returns {boolean} True when branch starts with `type/`.
 *
 * @example
 * branchMatchesType("feature/42-x", "feature"); // true
 * branchMatchesType("bugfix/1-y", "feature"); // false
 */
export function branchMatchesType(branch, type) {
  return String(branch ?? "").startsWith(`${type}/`);
}

/**
 * Whether HEAD equals `name`.
 *
 * @param {string} name - Expected branch name.
 * @returns {boolean} True when on that branch.
 *
 * @example
 * isOnBranch("develop");
 */
export function isOnBranch(name) {
  const head = headBranch();
  return Boolean(head) && head === name;
}

/**
 * Whether HEAD is a `type/` topic branch.
 *
 * @param {GitFlowType | string} type - Branch type.
 * @returns {boolean} True when on `type/…`.
 *
 * @example
 * isOnTypeBranch("feature");
 */
export function isOnTypeBranch(type) {
  return branchMatchesType(headBranch(), type);
}

/**
 * Whether the working tree has no staged or unstaged changes.
 *
 * @returns {boolean} True when clean.
 *
 * @example
 * isWorkingTreeClean();
 */
export function isWorkingTreeClean() {
  try {
    const status = run("git status --porcelain", { inherit: false });
    return status.trim() === "";
  } catch {
    return false;
  }
}

/**
 * Parses ahead/behind counts from `git rev-list --left-right --count`.
 *
 * @param {string} raw - stdout like "0\t0" or "1 0".
 * @returns {{ ahead: number, behind: number } | null} Counts, or null.
 *
 * @example
 * parseAheadBehind("0\t0"); // { ahead: 0, behind: 0 }
 */
export function parseAheadBehind(raw) {
  const match = String(raw ?? "")
    .trim()
    .match(/^(\d+)\s+(\d+)$/);
  if (!match) {
    return null;
  }
  return { ahead: Number(match[1]), behind: Number(match[2]) };
}

/**
 * Whether `base` and `origin/base` have zero ahead/behind.
 *
 * Does not fetch; callers that need freshness should fetch first.
 *
 * @param {string} base - Local branch name (e.g. `develop`).
 * @returns {boolean} True when fully synced.
 *
 * @example
 * isSyncedWithOrigin("develop");
 */
export function isSyncedWithOrigin(base) {
  try {
    run(`git rev-parse --verify origin/${base}`, { inherit: false });
  } catch {
    return false;
  }
  try {
    const raw = run(`git rev-list --left-right --count ${base}...origin/${base}`, {
      inherit: false,
    });
    const counts = parseAheadBehind(raw);
    return Boolean(counts) && counts.ahead === 0 && counts.behind === 0;
  } catch {
    return false;
  }
}

/**
 * Whether origin has the topic branch (fetch, then `ls-remote`).
 *
 * @param {string} branch - Full branch name.
 * @returns {boolean} True when published on origin.
 *
 * @example
 * remoteBranchExists("feature/42-x");
 */
export function remoteBranchExists(branch) {
  try {
    run("git fetch origin", { inherit: false });
  } catch {
    // continue; may already have refs
  }
  try {
    const raw = run(`git ls-remote --heads origin ${JSON.stringify(branch)}`, {
      inherit: false,
    });
    return Boolean(String(raw || "").trim());
  } catch {
    try {
      run(`git rev-parse --verify origin/${branch}`, { inherit: false });
      return true;
    } catch {
      return false;
    }
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 git-flow gates");
  const args = forwardedArgs();
  if (args.includes("--show-head")) {
    const branch = headBranch();
    if (!branch) {
      logError("Could not determine current branch");
      process.exit(1);
    }
    logInfo(branch);
    boxDone("git-flow gates");
    process.exit(0);
  }
  logInfo(`cwd=${repoRoot}`);
  logInfo("Helper module. Import from utils scripts, or pass --show-head.");
  boxDone("git-flow gates");
}
