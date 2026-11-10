#!/usr/bin/env node

/** ==============================================================
 * 🚀 Setup (post-clone bootstrap)
 * ---------------------------------------------------------------
 * Full machine bootstrap after cloning: prove Git and Node are on
 * PATH, run `npm clean-install` (which triggers `prepare`), then
 * run the CI gate (`npm run check`). Prefer this over a bare
 * prepare when onboarding a new working tree.
 *
 * HOW TO RUN:
 *   npm run setup
 *   node .devenv/setup.mjs
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
 *
 * @example
 * import { runSetup } from "./setup.mjs";
 * process.exit(runSetup());
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, run, runNpmScript } from "./lib/tool-lib.mjs";
import { isGitInstalled } from "./tools/git/isInstalled.mjs";
import { isNodeInstalled } from "./tools/node/isInstalled.mjs";

/**
 * Runs setup: git/node probes → `npm clean-install` → `check`.
 *
 * @returns {number} Process exit code (`0` on success).
 *
 * @example
 * // After clone:
 * //   git clone <url> && cd <dir> && npm run setup
 * const code = runSetup();
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
