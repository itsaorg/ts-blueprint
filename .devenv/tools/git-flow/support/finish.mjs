#!/usr/bin/env node

/** ==============================================================
 * 🛟 Support post-merge finish
 * ---------------------------------------------------------------
 * After the support PR (into `main` or your chosen base) is
 * reviewed and merged: verify merge + approval (+ issue link when
 * the name starts with `<number>-`), then delete the support branch
 * locally and on origin. Use when retiring the maintenance line.
 * Never creates a PR (publish does). Never runs a non-existent
 * `git flow support finish`.
 *
 * HOW TO RUN:
 *   npm run git:flow:support:finish
 *   node .devenv/tools/git-flow/support/finish.mjs
 *   node .devenv/tools/git-flow/support/finish.mjs --base main
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Post-merge finish for a Git Flow support branch.
 *
 * @module git-flow-support-finish
 *
 * @example
 * // After the PR is merged on GitHub:
 * //   npm run git:flow:support:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the support branch.
 *
 * @param {{ base?: string }} [options] - Optional base override.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * finishSupport({ base: "main" });
 */
export function finishSupport(options = {}) {
  return finishAfterMerge("support", { base: options.base || "main" });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🛟 support finish");
  const { base } = parseBaseArgs(forwardedArgs());
  if (forwardedArgs().includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (!finishSupport(base ? { base } : {}).ok) {
    process.exit(1);
  }
  boxDone("support finish");
}
