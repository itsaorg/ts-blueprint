#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow check
 * ---------------------------------------------------------------
 * Reports whether Git Flow AVH (`git flow`) is on PATH. Does not
 * install Git Flow and does not touch git config. When missing,
 * prints a short install guide (wiki link, Git Bash note, verify
 * command) via `logGitFlowInstallGuide`. Soft-skip callers use
 * `{ quiet: true }` and print the guide once themselves.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/isInstalled.mjs
 *   npm run git-flow:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Verifies that Git Flow AVH is on PATH and shares the install guide.
 *
 * Branch start/publish need AVH. Finish still opens a PR via
 * `finish-pr.mjs` and never runs `git flow * finish`.
 *
 * @module git-flow-is-installed
 *
 * @example
 * // CLI check (exits 1 when missing):
 * //   node .devenv/tools/git-flow/isInstalled.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logInfo, logOk, run } from "../../lib/tool-lib.mjs";

/**
 * @typedef {{ ok: true, version: string } | { ok: false }} GitFlowInstalledResult
 */

/**
 * Prints how to install Git Flow AVH when it is missing from PATH.
 *
 * Shared by flow commands (hard fail) and prepare/init (soft skip).
 * Call once per failure path so logs are not duplicated.
 *
 * @example
 * if (!isGitFlowInstalled({ quiet: true }).ok) {
 *   logGitFlowInstallGuide();
 * }
 *
 * @returns {void}
 */
export function logGitFlowInstallGuide() {
  logError("Git Flow AVH is not installed (or not on PATH).");
  logInfo("Install: https://github.com/petervanderdoes/gitflow-avh/wiki/Installation");
  logInfo("On Windows, install into Git for Windows and use Git Bash.");
  logInfo("Verify with: git flow version");
  logInfo("Branch start/publish need AVH; finish still opens a PR (never git flow * finish).");
}

/**
 * Checks whether `git flow` is on PATH.
 *
 * @param {{ quiet?: boolean }} [options] - When `quiet`, skip the install guide
 *   (caller may soft-skip and print the guide once itself).
 * @returns {GitFlowInstalledResult} Version when installed.
 *
 * @example
 * const result = isGitFlowInstalled();
 * if (!result.ok) process.exit(1);
 */
export function isGitFlowInstalled(options = {}) {
  const quiet = options.quiet === true;
  logGo("git flow version");
  try {
    const version = run("git flow version", { inherit: false });
    logOk(version);
    return { ok: true, version };
  } catch {
    if (!quiet) {
      logGitFlowInstallGuide();
    }
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌿 git-flow check");
  const result = isGitFlowInstalled();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git-flow check");
}
