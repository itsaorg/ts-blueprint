#!/usr/bin/env node

/** ==============================================================
 * 🌟 Git Flow feature publish
 * ---------------------------------------------------------------
 * Publishes a feature branch via git flow feature publish.
 * Omit the name to use the current branch.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/feature/publish.mjs [<name>]
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Publishes a Git Flow feature branch.
 *
 * @module git-flow-feature-publish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { currentBranch, runGitFlow, stripTypePrefix } from "../command.mjs";

/**
 * Runs `git flow feature publish …`.
 *
 * @param {string[]} [args] - Optional name; defaults to current branch.
 * @returns {{ ok: boolean }} Outcome.
 */
export function publishFeature(args = []) {
  let nameArgs = args;
  if (nameArgs.length === 0) {
    const branch = currentBranch();
    if (!branch.startsWith("feature/")) {
      logError(`Current branch "${branch}" is not a feature/ branch. Pass a name.`);
      return { ok: false };
    }
    nameArgs = [stripTypePrefix("feature", branch)];
  }
  return runGitFlow("feature", "publish", nameArgs);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌟 feature publish");
  if (!publishFeature(forwardedArgs()).ok) {
    process.exit(1);
  }
  boxDone("feature publish");
}
