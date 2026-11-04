#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix post-merge finish
 * ---------------------------------------------------------------
 * After the bugfix PR is merged: verify merge + approval + issue
 * link, then delete the topic branch. Solo: `--allow-unapproved`.
 *
 * HOW TO RUN:
 *   npm run git:flow:bugfix:finish
 *   node .devenv/tools/git-flow/bugfix/finish.mjs --allow-unapproved
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Post-merge finish for a Git Flow bugfix branch.
 *
 * @module git-flow-bugfix-finish
 *
 * @example
 * //   npm run git:flow:bugfix:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the bugfix branch.
 *
 * @param {{ base?: string, allowUnapproved?: boolean }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await finishBugfix();
 */
export async function finishBugfix(options = {}) {
  return finishAfterMerge("bugfix", {
    base: options.base || "develop",
    allowUnapproved: options.allowUnapproved,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix finish");
  const args = forwardedArgs();
  const { base, allowUnapproved } = parseBaseArgs(args);
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await finishBugfix({
    ...(base ? { base } : {}),
    allowUnapproved,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("bugfix finish");
}
