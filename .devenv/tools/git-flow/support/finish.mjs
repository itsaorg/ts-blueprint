#!/usr/bin/env node

/** ==============================================================
 * 🛟 Support post-merge finish
 * ---------------------------------------------------------------
 * After the support PR is merged: verify merge + approval, then
 * delete the support branch when retiring the line. Solo:
 * `--allow-unapproved` or TTY confirm.
 *
 * HOW TO RUN:
 *   npm run gf:support:finish
 *   node .devenv/tools/git-flow/support/finish.mjs --allow-unapproved
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Finish (merge + cleanup) for a Git Flow support branch.
 *
 * @module git-flow-support-finish
 *
 * @example
 * //   npm run gf:support:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../utils/finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the support branch.
 *
 * @param {{ base?: string, allowUnapproved?: boolean, prNumber?: string }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await finishSupport({ allowUnapproved: true });
 */
export async function finishSupport(options = {}) {
  return finishAfterMerge("support", {
    base: options.base || "main",
    allowUnapproved: options.allowUnapproved,
    prNumber: options.prNumber,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🛟 support finish");
  const args = forwardedArgs();
  const { base, allowUnapproved, prNumber } = parseBaseArgs(args);
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (args.includes("--pr") && !prNumber) {
    logError("Pass --pr <number>.");
    process.exit(1);
  }
  const result = await finishSupport({
    ...(base ? { base } : {}),
    allowUnapproved,
    prNumber,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("support finish");
}
