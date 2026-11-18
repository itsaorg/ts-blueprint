#!/usr/bin/env node

/** ==============================================================
 * 📝 Changeset add (interactive)
 * ---------------------------------------------------------------
 * Runs the interactive Changesets CLI to create one pending file
 * under `.changeset/` (package + semver + summary). Does **not**
 * bump `package.json` or rewrite `CHANGELOG.md` — that is
 * `changeset:version` on `release/*` or `hotfix/*` only.
 *
 * Branch gate: refuse `main`, `develop`, `release/*`, and detached
 * HEAD. Allowed on `feature/*`, `bugfix/*`, `hotfix/*`, `support/*`.
 * Pending-file checks belong to **publish**, not this command.
 *
 * HOW TO RUN:
 *   npm run changeset:add
 *   node .devenv/deps/changeset/add.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `changeset:add` — interactive pending Changeset note.
 *
 * @module changeset-add
 *
 * @example
 * // On feature/42-add-login:
 * //   npm run changeset:add
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logInfo,
  runTool,
} from "../../lib/tool-lib.mjs";
import { branchMatchesType } from "../../tools/git-flow/utils/gates/branchMatchesType.mjs";
import { headBranch } from "../../tools/git-flow/utils/gates/headBranch.mjs";

/**
 * Current git branch name, or empty string when detached / unavailable.
 *
 * @returns {string} Branch name.
 *
 * @example
 * currentBranchName(); // "feature/42-add-login"
 */
export function currentBranchName() {
  return headBranch();
}

/**
 * Whether `changeset:add` is allowed on this branch.
 *
 * Refuses trunk (`main`, `develop`), release lines (`release/*`),
 * and empty/detached names. Topic and maintenance branches are OK.
 *
 * @param {string} branch - Current branch name.
 * @returns {boolean} True when add may run.
 *
 * @example
 * isChangesetAddAllowedBranch("feature/42-x"); // true
 * isChangesetAddAllowedBranch("release/1.0.0"); // false
 */
export function isChangesetAddAllowedBranch(branch) {
  if (!branch) {
    return false;
  }
  if (branch === "main" || branch === "develop") {
    return false;
  }
  if (branchMatchesType(branch, "release")) {
    return false;
  }
  return (
    branchMatchesType(branch, "feature") ||
    branchMatchesType(branch, "bugfix") ||
    branchMatchesType(branch, "hotfix") ||
    branchMatchesType(branch, "support")
  );
}

/**
 * Default semver bump for a Git Flow type when guiding a pending write.
 *
 * Feature has no single default (caller prompts major|minor). Others use patch.
 *
 * @param {string} type - Git Flow type.
 * @returns {"major" | "minor" | "patch" | null} Locked bump, or null when prompted.
 *
 * @example
 * defaultBumpForGitFlowType("bugfix"); // "patch"
 * defaultBumpForGitFlowType("feature"); // null
 */
export function defaultBumpForGitFlowType(type) {
  if (type === "feature") {
    return null;
  }
  if (type === "bugfix" || type === "hotfix" || type === "support") {
    return "patch";
  }
  return null;
}

/**
 * Runs interactive `changeset add` when the branch gate passes.
 *
 * @param {string[]} [args] - Extra args for `changeset add`.
 * @returns {number} Process exit code (`0` = success).
 */
export function addChangeset(args = []) {
  const branch = currentBranchName();
  if (!isChangesetAddAllowedBranch(branch)) {
    logError(`changeset:add refused on branch "${branch || "(detached)"}".`);
    logInfo("Run on feature/*, bugfix/*, hotfix/*, or support/* only.");
    logInfo("Do not run on main, develop, or release/*.");
    return 1;
  }

  const cliArgs = ["add"].concat(args);
  return runTool({
    label: "changeset:add",
    bin: "changeset",
    args: cliArgs,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📝 changeset add");
  const code = addChangeset(forwardedArgs());
  if (code === 0) {
    boxDone("changeset add");
  }
  process.exitCode = code;
}
