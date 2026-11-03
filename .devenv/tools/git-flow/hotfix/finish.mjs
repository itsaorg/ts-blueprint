#!/usr/bin/env node

/** ==============================================================
 * 🚑 Hotfix post-merge finish
 * ---------------------------------------------------------------
 * After the hotfix PR into `main` is reviewed and merged: verify
 * merge + approval, confirm `changeset:version` already applied
 * (no leftover pending files; package.json matches branch version),
 * then delete the hotfix branch locally and on origin. Also open a
 * follow-up PR from `main` into `develop` when needed (manual).
 * Never creates a PR. Never runs `git flow hotfix finish`.
 *
 * HOW TO RUN:
 *   npm run git:flow:hotfix:finish
 *   node .devenv/tools/git-flow/hotfix/finish.mjs
 *   node .devenv/tools/git-flow/hotfix/finish.mjs --base main
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Post-merge finish for a Git Flow hotfix branch.
 *
 * @module git-flow-hotfix-finish
 *
 * @example
 * // After the PR is merged on GitHub:
 * //   npm run git:flow:hotfix:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError, logInfo } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the hotfix branch.
 *
 * @param {{ base?: string }} [options] - Optional base override.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * finishHotfix();
 */
export function finishHotfix(options = {}) {
  return finishAfterMerge("hotfix", { base: options.base || "main" });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚑 hotfix finish");
  const { base } = parseBaseArgs(forwardedArgs());
  if (forwardedArgs().includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (!finishHotfix(base ? { base } : {}).ok) {
    process.exit(1);
  }
  logInfo("Mandatory: open a PR from main into develop so the fix is not lost.");
  boxDone("hotfix finish");
}
