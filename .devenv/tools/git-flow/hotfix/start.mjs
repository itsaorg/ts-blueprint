#!/usr/bin/env node

/** ==============================================================
 * 🩹 Hotfix branch start
 * ---------------------------------------------------------------
 * Creates a new `hotfix/<x.y.z>` branch from main via
 * `git flow hotfix start`. Use for urgent production fixes that
 * need a patch release. Requires Git Flow AVH on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/hotfix/start.mjs <x.y.z>
 *   node .devenv/tools/git-flow/hotfix/start.mjs 1.2.1
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow hotfix branch.
 *
 * @module git-flow-hotfix-start
 *
 * @example
 * //   node .devenv/tools/git-flow/hotfix/start.mjs 1.2.1
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";

/**
 * Runs `git flow hotfix start …`.
 *
 * @param {string[]} [args] - Arguments after start (`<x.y.z>`).
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * startHotfix(["1.2.1"]);
 */
export function startHotfix(args = []) {
  if (args.length === 0) {
    logError("Pass <x.y.z>.");
    return { ok: false };
  }
  return runGitFlow("hotfix", "start", args);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🩹 hotfix start");
  if (!startHotfix(forwardedArgs()).ok) {
    process.exit(1);
  }
  boxDone("hotfix start");
}
