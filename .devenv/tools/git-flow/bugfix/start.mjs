#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix branch start
 * ---------------------------------------------------------------
 * Resolves a GitHub issue (interactive picker, or create via
 * `.git/ISSUE_EDITMSG`), then runs `git flow bugfix start` with
 * `<number>-<slug>` from that issue. Pass an existing
 * `<number>-<slug>` to skip the picker. Use for fixes that land
 * on develop (not production hotfixes). Requires Git Flow AVH.
 *
 * HOW TO RUN:
 *   npm run git:flow:bugfix:start
 *   npm run git:flow:bugfix:start -- 99-null-guard
 *   node .devenv/tools/git-flow/bugfix/start.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow bugfix branch.
 *
 * @module git-flow-bugfix-start
 *
 * @example
 * //   npm run git:flow:bugfix:start
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logInfo } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";
import { resolveIssueBranchName } from "../issue-gate.mjs";

/**
 * Resolves the issue name, then runs `git flow bugfix start …`.
 *
 * @param {string[]} [args] - Optional `[ "<number>-<slug>" ]`.
 * @returns {Promise<{ ok: boolean, name?: string }>} Outcome.
 *
 * @example
 * await startBugfix([]);
 * await startBugfix(["99-null-guard"]);
 */
export async function startBugfix(args = []) {
  const resolved = await resolveIssueBranchName(args);
  if (!resolved.ok || !resolved.name) {
    return { ok: false };
  }
  logInfo(`Starting bugfix/${resolved.name}`);
  const started = runGitFlow("bugfix", "start", [resolved.name]);
  return { ok: started.ok, name: resolved.name };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix start");
  if (!(await startBugfix(forwardedArgs())).ok) {
    process.exit(1);
  }
  boxDone("bugfix start");
}
