#!/usr/bin/env node

/** ==============================================================
 * 🩹 Git Flow hotfix publish
 * ---------------------------------------------------------------
 * Publishes a hotfix branch via git flow hotfix publish.
 * Omit the name to use the current branch.
 *
 * HOW TO RUN:
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
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { currentBranch, runGitFlow, stripTypePrefix } from "../command.mjs";

/**
 * Runs `git flow hotfix publish …`.
 *
 * @param {string[]} [args] - Optional name; defaults to current branch.
 * @returns {{ ok: boolean }} Outcome.
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
