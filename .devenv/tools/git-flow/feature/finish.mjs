#!/usr/bin/env node

/** ==============================================================
 * 🌟 Feature post-merge finish
 * ---------------------------------------------------------------
 * After the feature PR into `develop` is reviewed and merged:
 * verify merge + approval + issue link (`Closes #N` from the
 * `feature/<number>-…` name), then delete the topic branch locally
 * and on origin. Never creates a PR (that is publish). Never runs
 * `git flow feature finish`.
 *
 * HOW TO RUN:
 *   npm run git:flow:feature:finish
 *   node .devenv/tools/git-flow/feature/finish.mjs
 *   node .devenv/tools/git-flow/feature/finish.mjs --base develop
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Post-merge finish for a Git Flow feature branch.
 *
 * @module git-flow-feature-finish
 *
 * @example
 * // After the PR is merged on GitHub, still on feature/42-add-login:
 * //   npm run git:flow:feature:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the feature branch.
 *
 * @param {{ base?: string }} [options] - Optional base override.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * finishFeature();
 * finishFeature({ base: "develop" });
 */
export function finishFeature(options = {}) {
  return finishAfterMerge("feature", { base: options.base || "develop" });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌟 feature finish");
  const { base } = parseBaseArgs(forwardedArgs());
  if (forwardedArgs().includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (!finishFeature(base ? { base } : {}).ok) {
    process.exit(1);
  }
  boxDone("feature finish");
}
