#!/usr/bin/env node

/** ==============================================================
 * 🚀 Git Flow release finish
 * ---------------------------------------------------------------
 * PR-first finish for a release branch.
 * Pushes the branch and opens a pull request into main.
 * Never runs git flow release finish.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/release/finish.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * PR-first finish for a Git Flow release branch.
 *
 * @module git-flow-release-finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishWithPullRequest } from "../finish-pr.mjs";

/**
 * Pushes the current release branch and opens a PR into main.
 *
 * @param {{ base?: string }} [options] - Optional base override.
 * @returns {{ ok: boolean }} Outcome.
 */
export function finishRelease(options = {}) {
  return finishWithPullRequest("release", { base: options.base || "main" });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚀 release finish");
  const args = forwardedArgs();
  const baseFlag = args.indexOf("--base");
  const base = baseFlag === -1 ? undefined : args[baseFlag + 1];
  if (baseFlag !== -1 && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (!finishRelease(base ? { base } : {}).ok) {
    process.exit(1);
  }
  boxDone("release finish");
}
