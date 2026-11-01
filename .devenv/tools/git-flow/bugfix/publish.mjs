#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix branch publish
 * ---------------------------------------------------------------
 * Pushes a bugfix branch to origin via `git flow bugfix publish`.
 * Omit the name to publish the current `bugfix/…` branch.
 * Requires Git Flow AVH on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/bugfix/publish.mjs
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
 *
 * @example
 * // On bugfix/99-null-guard:
 * //   node .devenv/tools/git-flow/bugfix/publish.mjs
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
 *
 * @example
 * publishBugfix();
 * publishBugfix(["99-null-guard"]);
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
