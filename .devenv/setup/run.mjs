#!/usr/bin/env node

/** ==============================================================
 * 🚀 Development setup
 * ---------------------------------------------------------------
 * Runs npm clean-install (triggers prepare), then the CI gate.
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
 * Prepares a working tree with npm clean-install and the CI gate.
 *
 * @module setup-run
 */

import { boxBanner, boxDone, logError, logGo, run, runNpmScript } from "../lib/tool-lib.mjs";

/**
 * Runs the setup steps.
 *
 * @returns {number} Exit code.
 */
export function runSetup() {
  boxBanner("🚀 setup");
  logGo("npm clean-install");
  try {
    run("npm clean-install");
  } catch {
    logError("npm clean-install failed");
    return 1;
  }
  logGo("check");
  const code = runNpmScript("check");
  if (code !== 0) {
    logError("check failed");
    return code;
  }
  boxDone("setup");
  return 0;
}

const isMain = process.argv[1] && process.argv[1].endsWith("run.mjs");
if (isMain) {
  process.exit(runSetup());
}
