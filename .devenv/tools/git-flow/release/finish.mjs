#!/usr/bin/env node

/** ==============================================================
 * 🚀 Release PR finish
 * ---------------------------------------------------------------
 * PR-first finish for a release branch: push, then open a pull
 * request into `main` (override with `--base`). Never runs
 * `git flow release finish` — merges stay on GitHub so CI runs.
 * After merge, delete the topic branch locally and on origin.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/release/finish.mjs
 *   node .devenv/tools/git-flow/release/finish.mjs --base main
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
 *
 * @example
 * // On release/1.2.0:
 * //   node .devenv/tools/git-flow/release/finish.mjs
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
 *
 * @example
 * finishRelease();
 * finishRelease({ base: "main" });
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
