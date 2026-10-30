#!/usr/bin/env node

/** ==============================================================
 * 🐶 Prepare lifecycle
 * ---------------------------------------------------------------
 * After install: husky, git check + commit.template, gh setup
 * (auth + labels), npm auth. Idempotent. Does not run
 * npm clean-install or check.
 *
 * HOW TO RUN:
 *   npm run prepare
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Runs the npm prepare sequence for this repository.
 *
 * @module prepare-run
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, repoRoot, runNpmScript } from "../lib/tool-lib.mjs";
import { isGitInstalled } from "../tools/git/isInstalled.mjs";
import { setupGh } from "../tools/gh/setup.mjs";

/**
 * @param {string} script - Absolute script path.
 * @returns {number} Exit code.
 */
function runScript(script) {
  const result = spawnSync(process.execPath, [script], { cwd: repoRoot, stdio: "inherit" });
  return result.status ?? 1;
}

/**
 * Runs the prepare sequence.
 *
 * @returns {number} Exit code.
 */
export function runPrepare() {
  boxBanner("🐶 prepare");

  logGo("husky:prepare");
  const hooks = runNpmScript("husky:prepare");
  if (hooks !== 0) {
    logError("husky:prepare failed");
    return hooks;
  }

  logGo("git isInstalled");
  if (!isGitInstalled().ok) {
    logError("git isInstalled failed");
    return 1;
  }

  logGo("git configure");
  if (runScript(path.join(repoRoot, ".devenv/tools/git/configure.mjs")) !== 0) {
    logError("git configure failed");
    return 1;
  }

  logGo("gh setup");
  setupGh();

  logGo("npm auth");
  runScript(path.join(repoRoot, ".devenv/tools/npm/auth/setup.mjs"));

  boxDone("prepare");
  return 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(runPrepare());
}
