#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix post-merge finish
 * ---------------------------------------------------------------
 * After the bugfix PR is merged: verify merge + approval + issue
 * link, then delete the topic branch. Solo: `--allow-unapproved`.
 *
 * HOW TO RUN:
 *   npm run gf:bugfix:finish
 *   node .devenv/tools/git-flow/bugfix/finish.mjs --allow-unapproved
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Finish (merge + cleanup) for a Git Flow bugfix branch.
 *
 * @module git-flow-bugfix-finish
 *
 * @example
 * //   npm run gf:bugfix:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../utils/finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the bugfix branch.
 *
 * @param {{ base?: string, allowUnapproved?: boolean, prNumber?: string }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await finishBugfix();
 */
export async function finishBugfix(options = {}) {
  return finishAfterMerge("bugfix", {
    base: options.base || "develop",
    allowUnapproved: options.allowUnapproved,
    prNumber: options.prNumber,
    mergeStrategy: options.mergeStrategy,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix finish");
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
  const result = await finishBugfix({
    ...(base ? { base } : {}),
    allowUnapproved,
    prNumber,
    ...(mergeStrategy ? { mergeStrategy } : {}),
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("bugfix finish");
}
