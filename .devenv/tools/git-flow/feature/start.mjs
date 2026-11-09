#!/usr/bin/env node

/** ==============================================================
 * 🌟 Feature branch start
 * ---------------------------------------------------------------
 * Creates a new `feature/<number>-<slug>` branch from develop via
 * `git flow feature start`. Verifies (or interactively creates)
 * GitHub issue `<number>` before starting. Requires Git Flow AVH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/feature/start.mjs <number>-<slug>
 *   node .devenv/tools/git-flow/feature/start.mjs 42-add-login
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
 *
 * @example
 * //   node .devenv/tools/git-flow/feature/start.mjs 42-add-login
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";
import { ensureIssueForStart } from "../issue-gate.mjs";

/**
 * Runs the issue gate, then `git flow feature start …`.
 *
 * @param {string[]} [args] - Arguments after start (`<number>-<slug>`).
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await startFeature(["42-add-login"]);
 */
export async function startFeature(args = []) {
  if (args.length === 0) {
    logError("Pass <number>-<slug>.");
    return { ok: false };
  }
  if (!(await ensureIssueForStart(args[0])).ok) {
    return { ok: false };
  }
  return runGitFlow("feature", "start", args);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌟 feature start");
  if (!(await startFeature(forwardedArgs())).ok) {
    process.exit(1);
  }
  boxDone("feature start");
}
