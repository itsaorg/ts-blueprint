#!/usr/bin/env node

/** ==============================================================
 * 🩹 Hotfix branch start
 * ---------------------------------------------------------------
 * From a clean, synced `main`: resolve a GitHub issue (picker,
 * create, or `--issue <n>`), record `.git/CURRENT_ISSUE`, then
 * `git flow hotfix start <x.y.z>`.
 *
 * HOW TO RUN:
 *   npm run gf:hotfix:start -- 1.2.1
 *   npm run gf:hotfix:start -- --issue 42 1.2.1
 *   node .devenv/tools/git-flow/hotfix/start.mjs 1.2.1
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow hotfix branch.
 *
 * @module git-flow-hotfix-start
 *
 * @example
 * //   npm run gf:hotfix:start -- 1.2.1
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError, logInfo } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../utils/command.mjs";
import { assertVersionAboveFloor } from "../utils/assertVersionAboveFloor.mjs";
import {
  parseIssueFlagArgs,
  requireCleanSyncedBase,
  resolveLinkedIssue,
  writeCurrentIssue,
} from "../utils/start-gates.mjs";

/**
 * Issue gate + `git flow hotfix start …`.
 *
 * @param {string[]} [args] - `<x.y.z>` plus optional `--issue <n>`.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await startHotfix(["1.2.1"]);
 */
export async function startHotfix(args = []) {
  if (!requireCleanSyncedBase("main").ok) {
    return { ok: false };
  }

  const { issueFlag, rest } = parseIssueFlagArgs(args);
  if (rest.length === 0) {
    logError("Pass <x.y.z>.");
    return { ok: false };
  }

  if (!assertVersionAboveFloor(rest[0]).ok) {
    return { ok: false };
  }

  const linked = await resolveLinkedIssue({ issueFlag, gitFlowType: "hotfix" });
  if (!linked.ok || !linked.number) {
    return { ok: false };
  }
  if (!writeCurrentIssue(linked.number).ok) {
    return { ok: false };
  }

  logInfo(`Starting hotfix/${rest[0]} (issue #${linked.number})`);
  return runGitFlow("hotfix", "start", rest);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🩹 hotfix start");
  if (!(await startHotfix(forwardedArgs())).ok) {
    process.exit(1);
  }
  boxDone("hotfix start");
}
