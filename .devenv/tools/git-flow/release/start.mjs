#!/usr/bin/env node

/** ==============================================================
 * 🚀 Release branch start
 * ---------------------------------------------------------------
 * Creates a new `release/<x.y.z>` branch from develop via
 * `git flow release start`. Use when cutting a versioned release
 * candidate. Requires Git Flow AVH on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/release/start.mjs <x.y.z>
 *   node .devenv/tools/git-flow/release/start.mjs 1.2.0
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
 *
 * @example
 * //   node .devenv/tools/git-flow/release/start.mjs 1.2.0
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";

/**
 * Runs `git flow release start …`.
 *
 * @param {string[]} [args] - Arguments after start (`<x.y.z>`).
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * startRelease(["1.2.0"]);
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
