#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix post-merge finish
 * ---------------------------------------------------------------
 * After the bugfix PR into `develop` is reviewed and merged:
 * verify merge + approval + issue link, then delete the topic
 * branch locally and on origin. Never creates a PR (publish does).
 * Never runs `git flow bugfix finish`.
 *
 * HOW TO RUN:
 *   npm run git:flow:bugfix:finish
 *   node .devenv/tools/git-flow/bugfix/finish.mjs
 *   node .devenv/tools/git-flow/bugfix/finish.mjs --base develop
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
 * // After the PR is merged on GitHub:
 * //   npm run git:flow:bugfix:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the bugfix branch.
 *
 * @param {{ base?: string }} [options] - Optional base override.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * finishBugfix();
 */
export function finishBugfix(options = {}) {
  return finishAfterMerge("bugfix", { base: options.base || "develop" });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix finish");
  const { base } = parseBaseArgs(forwardedArgs());
  if (forwardedArgs().includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (!finishBugfix(base ? { base } : {}).ok) {
    process.exit(1);
  }
  boxDone("bugfix finish");
}
