#!/usr/bin/env node

/** ==============================================================
 * 🩹 Hotfix branch publish
 * ---------------------------------------------------------------
 * Pushes a hotfix branch to origin via `git flow hotfix publish`.
 * Omit the version to publish the current `hotfix/…` branch.
 * Requires Git Flow AVH on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/hotfix/publish.mjs
 *   node .devenv/tools/git-flow/hotfix/publish.mjs [<x.y.z>]
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Publishes a Git Flow hotfix branch.
 *
 * @module git-flow-hotfix-publish
 *
 * @example
 * // On hotfix/1.2.1:
 * //   node .devenv/tools/git-flow/hotfix/publish.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { currentBranch, runGitFlow, stripTypePrefix } from "../command.mjs";

/**
 * Runs `git flow hotfix publish …`.
 *
 * @param {string[]} [args] - Optional version; defaults to current branch.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * publishHotfix();
 * publishHotfix(["1.2.1"]);
 */
export function publishHotfix(args = []) {
  let nameArgs = args;
  if (nameArgs.length === 0) {
    const branch = currentBranch();
    if (!branch.startsWith("hotfix/")) {
      logError(`Current branch "${branch}" is not a hotfix/ branch. Pass a name.`);
      return { ok: false };
    }
    nameArgs = [stripTypePrefix("hotfix", branch)];
  }
  return runGitFlow("hotfix", "publish", nameArgs);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🩹 hotfix publish");
  if (!publishHotfix(forwardedArgs()).ok) {
    process.exit(1);
  }
  boxDone("hotfix publish");
}
