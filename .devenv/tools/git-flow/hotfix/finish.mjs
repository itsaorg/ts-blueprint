#!/usr/bin/env node

/** ==============================================================
 * 🚑 Hotfix post-merge finish
 * ---------------------------------------------------------------
 * After the hotfix PR into `main` is merged: version gates +
 * review/merge gates, then delete the branch. Solo maintainers:
 * `--allow-unapproved` or TTY confirm.
 *
 * HOW TO RUN:
 *   npm run gf:hotfix:finish
 *   node .devenv/tools/git-flow/hotfix/finish.mjs --allow-unapproved
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Finish (merge + cleanup) for a Git Flow hotfix branch.
 *
 * @module git-flow-hotfix-finish
 *
 * @example
 * //   npm run gf:hotfix:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError, logInfo } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../utils/finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the hotfix branch.
 *
 * @param {{ base?: string, allowUnapproved?: boolean, prNumber?: string }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await finishHotfix();
 */
export async function finishHotfix(options = {}) {
  return finishAfterMerge("hotfix", {
    base: options.base || "main",
    allowUnapproved: options.allowUnapproved,
    prNumber: options.prNumber,
    mergeStrategy: options.mergeStrategy,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚑 hotfix finish");
  const args = forwardedArgs();
  const { base, allowUnapproved, prNumber, mergeStrategy } = parseBaseArgs(args);
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (args.includes("--pr") && !prNumber) {
    logError("Pass --pr <number>.");
    process.exit(1);
  }
  if (args.includes("--merge") && args.includes("--squash")) {
    logError("Pass only one of --merge or --squash.");
    process.exit(1);
  }
  const result = await finishHotfix({
    ...(base ? { base } : {}),
    allowUnapproved,
    prNumber,
    ...(mergeStrategy ? { mergeStrategy } : {}),
  });
  if (!result.ok) {
    process.exit(1);
  }
  logInfo("Mandatory: open a PR from main into develop so the fix is not lost.");
  boxDone("hotfix finish");
}
