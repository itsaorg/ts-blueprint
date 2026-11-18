#!/usr/bin/env node

/** ==============================================================
 * 🌟 Feature finish
 * ---------------------------------------------------------------
 * CI green, approving review, issue link, merge (squash) into
 * develop, then delete the topic branch. Solo maintainers:
 * `--allow-unapproved` or TTY confirm.
 *
 * HOW TO RUN:
 *   npm run gf:feature:finish
 *   npm run gf:feature:finish -- --allow-unapproved --pr 25
 *   node .devenv/tools/git-flow/feature/finish.mjs --allow-unapproved
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Finish (merge + cleanup) for a Git Flow feature branch.
 *
 * @module git-flow-feature-finish
 *
 * @example
 * //   npm run gf:feature:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../utils/finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the feature branch.
 *
 * @param {{ base?: string, allowUnapproved?: boolean, prNumber?: string }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await finishFeature({ allowUnapproved: true });
 */
export async function finishFeature(options = {}) {
  return finishAfterMerge("feature", {
    base: options.base || "develop",
    allowUnapproved: options.allowUnapproved,
    prNumber: options.prNumber,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌟 feature finish");
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
  const result = await finishFeature({
    ...(base ? { base } : {}),
    allowUnapproved,
    prNumber,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("feature finish");
}
