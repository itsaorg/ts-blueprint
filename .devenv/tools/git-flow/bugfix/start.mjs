#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix branch start
 * ---------------------------------------------------------------
 * Creates a new `bugfix/<number>-<slug>` branch from develop via
 * `git flow bugfix start`. Verifies (or interactively creates)
 * GitHub issue `<number>` before starting. Use for fixes that
 * land on develop (not production hotfixes). Requires Git Flow AVH.
 *
 * HOW TO RUN:
 *   npm run git:flow:bugfix:start <number>-<slug>
 *   node .devenv/tools/git-flow/bugfix/start.mjs <number>-<slug>
 *   npm run git:flow:bugfix:start 99-null-guard
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
import { ensureIssueForStart } from "../issue-gate.mjs";

/**
 * Runs the issue gate, then `git flow bugfix start …`.
 *
 * @param {string[]} [args] - Arguments after start (`<number>-<slug>`).
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await startBugfix(["99-null-guard"]);
 */
export async function startBugfix(args = []) {
  if (args.length === 0) {
    logError("Pass <number>-<slug>.");
    return { ok: false };
  }
  if (!(await ensureIssueForStart(args[0])).ok) {
    return { ok: false };
  }
  return runGitFlow("bugfix", "start", args);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix start");
  if (!(await startBugfix(forwardedArgs())).ok) {
    process.exit(1);
  }
  boxDone("bugfix start");
}
