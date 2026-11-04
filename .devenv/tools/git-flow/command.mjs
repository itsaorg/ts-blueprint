#!/usr/bin/env node

/** ==============================================================
 * ⚙️ Git Flow command helper
 * ---------------------------------------------------------------
 * Shared runner for `git flow <type> <action> …` plus small branch
 * helpers (current name, strip type prefix, push with upstream).
 * Requires Git Flow AVH on PATH for `runGitFlow`. Used by
 * feature/bugfix/release/hotfix/support start and publish modules.
 * Finish uses `finish-merged.mjs` (post-merge gates); publish uses
 * `publish-flow.mjs` (pending changesets + PR create).
 *
 * HOW TO RUN:
 *   imported by git-flow branch modules
 *   node .devenv/tools/git-flow/command.mjs --show-branch
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Shared Git Flow CLI helpers for start/publish wrappers.
 *
 * @module git-flow-command
 *
 * @example
 * import { runGitFlow, currentBranch } from "../command.mjs";
 * runGitFlow("feature", "start", ["42-add-login"]);
 * console.log(currentBranch());
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logGo,
  logInfo,
  logOk,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";
import { isGitFlowInstalled } from "./isInstalled.mjs";

/**
 * @typedef {"feature" | "bugfix" | "release" | "hotfix" | "support"} GitFlowType
 */

/**
 * Runs `git flow <type> <action> …args`.
 *
 * Checks AVH first; inherits stdio so git-flow prompts/output show.
 *
 * @param {GitFlowType} type - Branch type.
 * @param {string} action - Subcommand (start, publish, …).
 * @param {string[]} [args] - Extra argv after the action.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * runGitFlow("release", "start", ["1.2.0"]);
 * runGitFlow("feature", "publish", ["42-add-login"]);
 */
export function runGitFlow(type, action, args = []) {
  const installed = isGitFlowInstalled();
  if (!installed.ok) {
    return { ok: false };
  }
  const argv = ["flow", type, action, ...args];
  logGo(`git ${argv.join(" ")}`);
  const result = spawnSync("git", argv, { cwd: repoRoot, stdio: "inherit" });
  if ((result.status ?? 1) !== 0) {
    logError(`git flow ${type} ${action} failed`);
    return { ok: false };
  }
  logOk(`git flow ${type} ${action} finished`);
  return { ok: true };
}

/**
 * Current git branch name, or empty string.
 *
 * @returns {string} Branch name.
 *
 * @example
 * const branch = currentBranch(); // "feature/42-add-login"
 */
export function currentBranch() {
  try {
    return run("git branch --show-current", { inherit: false });
  } catch {
    return "";
  }
}

/**
 * Strips the git-flow type prefix from a branch name when present.
 *
 * @param {GitFlowType} type - Branch type.
 * @param {string} branch - Full branch name.
 * @returns {string} Name without `type/` prefix.
 *
 * @example
 * stripTypePrefix("feature", "feature/42-add-login"); // "42-add-login"
 */
export function stripTypePrefix(type, branch) {
  const prefix = `${type}/`;
  return branch.startsWith(prefix) ? branch.slice(prefix.length) : branch;
}

/**
 * Pushes the current branch to origin with upstream tracking.
 *
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * if (!pushCurrentBranch().ok) process.exit(1);
 */
export function pushCurrentBranch() {
  const branch = currentBranch();
  if (!branch) {
    logError("Could not determine current branch");
    return { ok: false };
  }
  logGo(`git push -u origin ${branch}`);
  try {
    run(`git push -u origin HEAD`);
    logOk(`Pushed ${branch}`);
    return { ok: true };
  } catch {
    logError(`Failed to push ${branch}`);
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("⚙️ git-flow command");
  const args = forwardedArgs();
  if (args.includes("--show-branch")) {
    const branch = currentBranch();
    if (!branch) {
      logError("Could not determine current branch");
      process.exit(1);
    }
    logInfo(branch);
    boxDone("git-flow command");
    process.exit(0);
  }
  logInfo("Helper module. Use type start/publish/finish scripts, or pass --show-branch.");
  boxDone("git-flow command");
}
