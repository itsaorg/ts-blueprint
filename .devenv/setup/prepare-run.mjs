#!/usr/bin/env node

/** ==============================================================
 * 🐶 Prepare lifecycle
 * ---------------------------------------------------------------
 * After install: husky, git/node/gh/npm/git-flow setups.
 * Idempotent. Does not run npm clean-install or check.
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

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, runNpmScript } from "../lib/tool-lib.mjs";
import { setupGh } from "../tools/gh/setup.mjs";
import { setupGit } from "../tools/git/setup.mjs";
import { setupGitFlow } from "../tools/git-flow/setup.mjs";
import { setupNode } from "../tools/node/setup.mjs";
import { setupNpm } from "../tools/npm/setup.mjs";

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

  logGo("git setup");
  if (!setupGit().ok) {
    logError("git setup failed");
    return 1;
  }

  logGo("node setup");
  setupNode();

  logGo("gh setup");
  setupGh();

  logGo("npm setup");
  setupNpm();

  logGo("git-flow setup");
  setupGitFlow();

  boxDone("prepare");
  return 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(runPrepare());
}
