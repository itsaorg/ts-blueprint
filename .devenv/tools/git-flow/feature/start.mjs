#!/usr/bin/env node

/** ==============================================================
 * 🌟 Feature branch start
 * ---------------------------------------------------------------
 * Resolves a GitHub issue (interactive picker, or create via
 * `.git/ISSUE_EDITMSG`), then runs `git flow feature start` with
 * `<number>-<slug>` from that issue. Pass an existing
 * `<number>-<slug>` to skip the picker. Requires Git Flow AVH.
 *
 * HOW TO RUN:
 *   npm run git:flow:feature:start
 *   npm run git:flow:feature:start -- 42-add-login
 *   node .devenv/tools/git-flow/feature/start.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow feature branch.
 *
 * @module git-flow-feature-start
 *
 * @example
 * //   npm run git:flow:feature:start
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logInfo } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";
import { resolveIssueBranchName } from "../issue-gate.mjs";

/**
 * Resolves the issue name, then runs `git flow feature start …`.
 *
 * @param {string[]} [args] - Optional `[ "<number>-<slug>" ]`.
 * @returns {Promise<{ ok: boolean, name?: string }>} Outcome.
 *
 * @example
 * await startFeature([]);
 * await startFeature(["42-add-login"]);
 */
export async function startFeature(args = []) {
  const resolved = await resolveIssueBranchName(args);
  if (!resolved.ok || !resolved.name) {
    return { ok: false };
  }
  logInfo(`Starting feature/${resolved.name}`);
  const started = runGitFlow("feature", "start", [resolved.name]);
  return { ok: started.ok, name: resolved.name };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌟 feature start");
  if (!(await startFeature(forwardedArgs())).ok) {
    process.exit(1);
  }
  boxDone("feature start");
}
