#!/usr/bin/env node

/** ==============================================================
 * 🚀 Setup
 * ---------------------------------------------------------------
 * After clone or for a fresh working tree: git/node checks,
 * npm clean-install (runs prepare), then the CI gate.
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
 * Prepares a working tree with probes, clean-install, and check.
 *
 * @module setup
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, run, runNpmScript } from "./lib/tool-lib.mjs";
import { isGitInstalled } from "./tools/git/isInstalled.mjs";
import { isNodeInstalled } from "./tools/node/isInstalled.mjs";

/**
 * Runs setup: probes, clean-install, check.
 *
 * @returns {number} Exit code.
 */
export function runSetup() {
  boxBanner("🚀 setup");

  logGo("git check");
  if (!isGitInstalled().ok) {
    logError("git check failed");
    return 1;
  }

  logGo("node check");
  if (!isNodeInstalled().ok) {
    logError("node check failed");
    return 1;
  }

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

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(runSetup());
}
