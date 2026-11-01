#!/usr/bin/env node

/** ==============================================================
 * 🌟 Git Flow feature start
 * ---------------------------------------------------------------
 * Starts a feature branch via git flow feature start.
 * Pass <number>-<slug>.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/feature/start.mjs <number>-<slug>
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow feature branch.
 *
 * @module git-flow-feature-start
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";

/**
 * Runs `git flow feature start …`.
 *
 * @param {string[]} [args] - Arguments after start.
 * @returns {{ ok: boolean }} Outcome.
 */
export function startFeature(args = []) {
  if (args.length === 0) {
    logError("Pass <number>-<slug>.");
    return { ok: false };
  }
  return runGitFlow("feature", "start", args);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌟 feature start");
  if (!startFeature(forwardedArgs()).ok) {
    process.exit(1);
  }
  boxDone("feature start");
}
