#!/usr/bin/env node

/** ==============================================================
 * 🐛 Git Flow bugfix finish
 * ---------------------------------------------------------------
 * PR-first finish for a bugfix branch.
 * Pushes the branch and opens a pull request into develop.
 * Never runs git flow bugfix finish.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/bugfix/finish.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * PR-first finish for a Git Flow bugfix branch.
 *
 * @module git-flow-bugfix-finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishWithPullRequest } from "../finish-pr.mjs";

/**
 * Pushes the current bugfix branch and opens a PR into develop.
 *
 * @param {{ base?: string }} [options] - Optional base override.
 * @returns {{ ok: boolean }} Outcome.
 */
export function finishBugfix(options = {}) {
  return finishWithPullRequest("bugfix", { base: options.base || "develop" });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix finish");
  const args = forwardedArgs();
  const baseFlag = args.indexOf("--base");
  const base = baseFlag === -1 ? undefined : args[baseFlag + 1];
  if (baseFlag !== -1 && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (!finishBugfix(base ? { base } : {}).ok) {
    process.exit(1);
  }
  boxDone("bugfix finish");
}
