#!/usr/bin/env node

/** ==============================================================
 * 🚀 Git Flow release start
 * ---------------------------------------------------------------
 * Starts a release branch via git flow release start.
 * Pass <x.y.z>.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/release/start.mjs <x.y.z>
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow release branch.
 *
 * @module git-flow-release-start
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";

/**
 * Runs `git flow release start …`.
 *
 * @param {string[]} [args] - Arguments after start.
 * @returns {{ ok: boolean }} Outcome.
 */
export function startRelease(args = []) {
  if (args.length === 0) {
    logError("Pass <x.y.z>.");
    return { ok: false };
  }
  return runGitFlow("release", "start", args);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚀 release start");
  if (!startRelease(forwardedArgs()).ok) {
    process.exit(1);
  }
  boxDone("release start");
}
