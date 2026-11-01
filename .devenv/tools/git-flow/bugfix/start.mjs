#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix branch start
 * ---------------------------------------------------------------
 * Creates a new `bugfix/<number>-<slug>` branch from develop via
 * `git flow bugfix start`. Use for fixes that land on develop
 * (not production hotfixes). Requires Git Flow AVH on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/bugfix/start.mjs <number>-<slug>
 *   node .devenv/tools/git-flow/bugfix/start.mjs 99-null-guard
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow bugfix branch.
 *
 * @module git-flow-bugfix-start
 *
 * @example
 * //   node .devenv/tools/git-flow/bugfix/start.mjs 99-null-guard
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";

/**
 * Runs `git flow bugfix start …`.
 *
 * @param {string[]} [args] - Arguments after start (`<number>-<slug>`).
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * startBugfix(["99-null-guard"]);
 */
export function startBugfix(args = []) {
  if (args.length === 0) {
    logError("Pass <number>-<slug>.");
    return { ok: false };
  }
  return runGitFlow("bugfix", "start", args);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix start");
  if (!startBugfix(forwardedArgs()).ok) {
    process.exit(1);
  }
  boxDone("bugfix start");
}
