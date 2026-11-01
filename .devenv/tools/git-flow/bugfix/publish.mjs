#!/usr/bin/env node

/** ==============================================================
 * 🐛 Git Flow bugfix publish
 * ---------------------------------------------------------------
 * Publishes a bugfix branch via git flow bugfix publish.
 * Omit the name to use the current branch.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/bugfix/publish.mjs [<name>]
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Publishes a Git Flow bugfix branch.
 *
 * @module git-flow-bugfix-publish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { currentBranch, runGitFlow, stripTypePrefix } from "../command.mjs";

/**
 * Runs `git flow bugfix publish …`.
 *
 * @param {string[]} [args] - Optional name; defaults to current branch.
 * @returns {{ ok: boolean }} Outcome.
 */
export function publishBugfix(args = []) {
  let nameArgs = args;
  if (nameArgs.length === 0) {
    const branch = currentBranch();
    if (!branch.startsWith("bugfix/")) {
      logError(`Current branch "${branch}" is not a bugfix/ branch. Pass a name.`);
      return { ok: false };
    }
    nameArgs = [stripTypePrefix("bugfix", branch)];
  }
  return runGitFlow("bugfix", "publish", nameArgs);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix publish");
  if (!publishBugfix(forwardedArgs()).ok) {
    process.exit(1);
  }
  boxDone("bugfix publish");
}
