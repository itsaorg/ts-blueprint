#!/usr/bin/env node

/** ==============================================================
 * 📦 Release post-merge finish
 * ---------------------------------------------------------------
 * After the release PR into `main` is reviewed and merged: verify
 * merge + approval, confirm version already applied (no leftover
 * pending changesets; package.json matches `release/<x.y.z>`), then
 * delete the release branch locally and on origin. Tag `v*` on main
 * after finish when you are ready for `release.yml`. Never creates
 * a PR. Never runs `git flow release finish`.
 *
 * HOW TO RUN:
 *   npm run git:flow:release:finish
 *   node .devenv/tools/git-flow/release/finish.mjs
 *   node .devenv/tools/git-flow/release/finish.mjs --base main
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Post-merge finish for a Git Flow release branch.
 *
 * @module git-flow-release-finish
 *
 * @example
 * // After the PR is merged on GitHub:
 * //   npm run git:flow:release:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError, logInfo } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the release branch.
 *
 * @param {{ base?: string }} [options] - Optional base override.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * finishRelease();
 */
export function finishRelease(options = {}) {
  return finishAfterMerge("release", { base: options.base || "main" });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📦 release finish");
  const { base } = parseBaseArgs(forwardedArgs());
  if (forwardedArgs().includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (!finishRelease(base ? { base } : {}).ok) {
    process.exit(1);
  }
  logInfo("On main: tag v<version> and push the tag so release.yml can publish.");
  boxDone("release finish");
}
