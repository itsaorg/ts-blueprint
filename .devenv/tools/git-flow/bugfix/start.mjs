#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix branch start
 * ---------------------------------------------------------------
 * From a clean, synced `develop`: resolve a GitHub issue (picker,
 * create via `.git/ISSUE_EDITMSG`, or explicit `<number>-<slug>`),
 * record `.git/CURRENT_ISSUE`, then `git flow bugfix start`.
 *
 * HOW TO RUN:
 *   npm run gf:bugfix:start
 *   npm run gf:bugfix:start -- 99-null-guard
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
 * //   npm run gf:bugfix:start
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logInfo } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../utils/command.mjs";
import { parseIssueSlug, resolveIssueBranchName } from "../utils/issue-gate.mjs";
import { requireCleanSyncedBase, writeCurrentIssue } from "../utils/start-gates.mjs";

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
  if (!requireCleanSyncedBase("develop").ok) {
    return { ok: false };
  }

  const resolved = await resolveIssueBranchName(args, { gitFlowType: "bugfix" });
  if (!resolved.ok || !resolved.name) {
    return { ok: false };
  }

  const parsed = parseIssueSlug(resolved.name);
  if (parsed?.number && !writeCurrentIssue(parsed.number).ok) {
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
