#!/usr/bin/env node

/** ==============================================================
 * 🩹 Git Flow hotfix finish
 * ---------------------------------------------------------------
 * PR-first finish for a hotfix branch.
 * Pushes the branch and opens a pull request into main.
 * Never runs git flow hotfix finish.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/hotfix/finish.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * PR-first finish for a Git Flow hotfix branch.
 *
 * @module git-flow-hotfix-finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishWithPullRequest } from "../finish-pr.mjs";

/**
 * Pushes the current hotfix branch and opens a PR into main.
 *
 * @param {{ base?: string }} [options] - Optional base override.
 * @returns {{ ok: boolean }} Outcome.
 */
export function finishHotfix(options = {}) {
  return finishWithPullRequest("hotfix", { base: options.base || "main" });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🩹 hotfix finish");
  const args = forwardedArgs();
  const baseFlag = args.indexOf("--base");
  const base = baseFlag === -1 ? undefined : args[baseFlag + 1];
  if (baseFlag !== -1 && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (!finishHotfix(base ? { base } : {}).ok) {
    process.exit(1);
  }
  boxDone("hotfix finish");
}
