#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix PR finish
 * ---------------------------------------------------------------
 * PR-first finish for a bugfix branch: push, then open a pull
 * request into `develop` (override with `--base`). Never runs
 * `git flow bugfix finish` — merges stay on GitHub so CI runs.
 * After merge, delete the topic branch locally and on origin.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/bugfix/finish.mjs
 *   node .devenv/tools/git-flow/bugfix/finish.mjs --base develop
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * PR-first finish for a Git Flow bugfix branch.
 *
 * @module git-flow-bugfix-finish
 *
 * @example
 * // On bugfix/99-null-guard:
 * //   node .devenv/tools/git-flow/bugfix/finish.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { finishWithPullRequest } from "../finish-pr.mjs";

/**
 * Pushes the current bugfix branch and opens a PR into develop.
 *
 * @param {{ base?: string }} [options] - Optional base override.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * finishBugfix();
 * finishBugfix({ base: "develop" });
 */
export function finishBugfix(options = {}) {
  return finishWithPullRequest("bugfix", { base: options.base || "develop" });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix finish");
  const args = forwardedArgs();
  const baseFlag = args.indexOf("--base");
  const base = baseFlag === -1 ? undefined : args[baseFlag + 1];
  if (baseFlag !== -1 && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (!finishBugfix(base ? { base } : {}).ok) {
    process.exit(1);
  }
  boxDone("bugfix finish");
}
