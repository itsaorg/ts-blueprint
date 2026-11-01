#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow command helper
 * ---------------------------------------------------------------
 * Shared runner for `git flow <type> <action> …`.
 *
 * HOW TO RUN:
 *   imported by git-flow branch modules
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Shared Git Flow CLI helpers.
 *
 * @module git-flow-command
 */

import { spawnSync } from "node:child_process";
import { logError, logGo, logOk, repoRoot, run } from "../../lib/tool-lib.mjs";
import { isGitFlowInstalled } from "./isInstalled.mjs";

/**
 * @typedef {"feature" | "bugfix" | "release" | "hotfix" | "support"} GitFlowType
 */

/**
 * Runs `git flow <type> <action> …args`.
 *
 * @param {GitFlowType} type - Branch type.
 * @param {string} action - Subcommand (start, publish, …).
 * @param {string[]} [args] - Extra argv.
 * @returns {{ ok: boolean }} Outcome.
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
 */
export function stripTypePrefix(type, branch) {
  const prefix = `${type}/`;
  return branch.startsWith(prefix) ? branch.slice(prefix.length) : branch;
}

/**
 * Pushes the current branch to origin with upstream.
 *
 * @returns {{ ok: boolean }} Outcome.
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
