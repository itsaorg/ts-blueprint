#!/usr/bin/env node

/** ==============================================================
 * 🌟 Feature branch publish
 * ---------------------------------------------------------------
 * Pushes a feature branch to origin via `git flow feature publish`
 * so others (and CI) can see it. Omit the name to publish the
 * current `feature/…` branch. Requires Git Flow AVH on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/feature/publish.mjs
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
 *
 * @example
 * // On feature/42-add-login:
 * //   node .devenv/tools/git-flow/feature/publish.mjs
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
 *
 * @example
 * publishFeature(); // uses current feature/ branch
 * publishFeature(["42-add-login"]);
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
