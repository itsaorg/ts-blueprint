#!/usr/bin/env node

/** ==============================================================
 * 🐶 Prepare lifecycle
 * ---------------------------------------------------------------
 * npm lifecycle hook after install (`prepare`). Wires Husky hooks,
 * then runs idempotent git / node / gh / npm / git-flow setups.
 * Does not run `npm clean-install` or the CI `check` gate — use
 * `npm run setup` for a full post-clone bootstrap.
 *
 * Soft-skips optional tools (e.g. missing Git Flow AVH) so install
 * still succeeds; required git/husky failures exit non-zero.
 *
 * HOW TO RUN:
 *   npm run prepare
 *   node .devenv/prepare.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Runs the npm prepare sequence for this repository.
 *
 * Order: husky → git setup → node setup → gh setup → npm setup →
 * git-flow setup. Each step logs with boxed banners from tool-lib.
 *
 * @module prepare
 *
 * @example
 * import { runPrepare } from "./prepare.mjs";
 * process.exit(runPrepare());
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, runNpmScript } from "./lib/tool-lib.mjs";
import { setupGh } from "./tools/gh/setup.mjs";
import { setupGit } from "./tools/git/setup.mjs";
import { setupGitFlow } from "./tools/git-flow/setup.mjs";
import { setupNode } from "./tools/node/setup.mjs";
import { setupNpm } from "./tools/npm/setup.mjs";

/**
 * Runs the prepare sequence.
 *
 * @returns {number} Process exit code (`0` on success).
 *
 * @example
 * // From package.json: "prepare": "node .devenv/prepare.mjs"
 * const code = runPrepare();
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
