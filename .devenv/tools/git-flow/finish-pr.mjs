#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow PR-first finish helper
 * ---------------------------------------------------------------
 * Shared finish: push branch and open a pull request. Never runs
 * `git flow <type> finish` (that merges locally and skips CI).
 *
 * HOW TO RUN:
 *   imported by git-flow finish modules
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * PR-first finish for Git Flow topic branches.
 *
 * @module git-flow-finish-pr
 */

import { spawnSync } from "node:child_process";
import { logError, logGo, logInfo, logOk, logSkip, repoRoot, run } from "../../lib/tool-lib.mjs";
import { currentBranch, pushCurrentBranch } from "./command.mjs";
import { isGitFlowInstalled } from "./isInstalled.mjs";

/**
 * @typedef {"feature" | "bugfix" | "release" | "hotfix"} FinishableType
 */

/**
 * Default PR base for a Git Flow type.
 *
 * @param {FinishableType} type - Branch type.
 * @returns {string} Base branch.
 */
export function defaultBaseFor(type) {
  if (type === "feature" || type === "bugfix") {
    return "develop";
  }
  return "main";
}

/**
 * Ensures gh is available and authenticated.
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
 * PR-first finish: push current branch, create PR into base.
 *
 * @param {FinishableType} type - Branch type.
 * @param {{ base?: string }} [options] - Override PR base.
 * @returns {{ ok: boolean }} Outcome.
 */
export function finishWithPullRequest(type, options = {}) {
  if (!isGitFlowInstalled().ok) {
    return { ok: false };
  }

  const branch = currentBranch();
  if (!branch) {
    logError("Could not determine current branch");
    return { ok: false };
  }
  if (!branch.startsWith(`${type}/`)) {
    logError(`Current branch "${branch}" is not a ${type}/ branch`);
    return { ok: false };
  }

  if (!pushCurrentBranch().ok) {
    return { ok: false };
  }

  const base = options.base || defaultBaseFor(type);
  if (!ghReady()) {
    logSkip("gh is not authenticated. Push succeeded; open a PR manually:");
    logInfo(`gh pr create --base ${base} --fill`);
    logInfo("After merge, delete the topic branch locally and on origin.");
    return { ok: true };
  }

  logGo(`gh pr create --base ${base} --fill`);
  const result = spawnSync("gh", ["pr", "create", "--base", base, "--fill"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if ((result.status ?? 1) !== 0) {
    logError("gh pr create failed");
    logInfo("Push succeeded; open or update the PR on GitHub, then delete the branch after merge.");
    return { ok: false };
  }
  logOk(`Pull request opened into ${base}`);
  logInfo("After merge and CI are green, delete the topic branch locally and on origin.");
  logInfo(`Do not run: git flow ${type} finish`);
  return { ok: true };
}
