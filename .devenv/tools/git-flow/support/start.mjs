#!/usr/bin/env node

/** ==============================================================
 * 🛟 Git Flow support start
 * ---------------------------------------------------------------
 * Starts a support branch via git flow support start.
 * Pass <name> <base>.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/support/start.mjs <name> <base>
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow support branch.
 *
 * @module git-flow-support-start
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";

/**
 * Runs `git flow support start …`.
 *
 * @param {string[]} [args] - <name> <base>.
 * @returns {{ ok: boolean }} Outcome.
 */
export function startSupport(args = []) {
  if (args.length < 2) {
    logError("Pass <name> <base>.");
    return { ok: false };
  }
  return runGitFlow("support", "start", args);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🛟 support start");
  if (!startSupport(forwardedArgs()).ok) {
    process.exit(1);
  }
  boxDone("support start");
}
