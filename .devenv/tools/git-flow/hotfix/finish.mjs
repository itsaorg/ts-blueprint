#!/usr/bin/env node

/** ==============================================================
 * 🩹 Hotfix PR finish
 * ---------------------------------------------------------------
 * PR-first finish for a hotfix branch: push, then open a pull
 * request into `main` (override with `--base`). Never runs
 * `git flow hotfix finish` — merges stay on GitHub so CI runs.
 * After merge, delete the topic branch locally and on origin.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/hotfix/finish.mjs
 *   node .devenv/tools/git-flow/hotfix/finish.mjs --base main
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
 *
 * @example
 * // On hotfix/1.2.1:
 * //   node .devenv/tools/git-flow/hotfix/finish.mjs
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
 *
 * @example
 * finishHotfix();
 * finishHotfix({ base: "main" });
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
