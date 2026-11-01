#!/usr/bin/env node

/** ==============================================================
 * 🚀 Release branch publish
 * ---------------------------------------------------------------
 * Pushes a release branch to origin via `git flow release publish`.
 * Omit the version to publish the current `release/…` branch.
 * Requires Git Flow AVH on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/release/publish.mjs
 *   node .devenv/tools/git-flow/release/publish.mjs [<x.y.z>]
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Publishes a Git Flow release branch.
 *
 * @module git-flow-release-publish
 *
 * @example
 * // On release/1.2.0:
 * //   node .devenv/tools/git-flow/release/publish.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { currentBranch, runGitFlow, stripTypePrefix } from "../command.mjs";

/**
 * Runs `git flow release publish …`.
 *
 * @param {string[]} [args] - Optional version; defaults to current branch.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * publishRelease();
 * publishRelease(["1.2.0"]);
 */
export function publishRelease(args = []) {
  let nameArgs = args;
  if (nameArgs.length === 0) {
    const branch = currentBranch();
    if (!branch.startsWith("release/")) {
      logError(`Current branch "${branch}" is not a release/ branch. Pass a name.`);
      return { ok: false };
    }
    nameArgs = [stripTypePrefix("release", branch)];
  }
  return runGitFlow("release", "publish", nameArgs);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚀 release publish");
  if (!publishRelease(forwardedArgs()).ok) {
    process.exit(1);
  }
  boxDone("release publish");
}
