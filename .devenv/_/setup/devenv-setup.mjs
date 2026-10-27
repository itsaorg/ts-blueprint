#!/usr/bin/env node

/** ==============================================================
 * 🚀 Development setup
 * ---------------------------------------------------------------
 * Installs dependencies, installs Husky hooks, then runs check.
 * Does not delete node_modules and does not run git config.
 *
 * HOW TO RUN:
 *   npm run setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Prepares a working tree with npm ci, Husky, and the CI gate.
 *
 * @module devenv-setup
 */

import { boxBanner, boxDone, logError, logGo, run, runNpmScript } from "../lib/tool-lib.mjs";

/**
 * Runs the setup steps.
 *
 * @returns {number} Exit code.
 */
export function runSetup() {
  boxBanner("🚀 devenv setup");
  logGo("npm ci");
  try {
    run("npm ci");
  } catch {
    logError("npm ci failed");
    return 1;
  }
  logGo("husky:prepare");
  let code = runNpmScript("husky:prepare");
  if (code !== 0) {
    logError("husky:prepare failed");
    return code;
  }
  logGo("check");
  code = runNpmScript("check");
  if (code !== 0) {
    logError("check failed");
    return code;
  }
  boxDone("devenv setup");
  return 0;
}

const isMain = process.argv[1] && process.argv[1].endsWith("devenv-setup.mjs");
if (isMain) {
  process.exit(runSetup());
}
