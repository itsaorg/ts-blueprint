#!/usr/bin/env node

/** ==============================================================
 * 🚀 Release branch start
 * ---------------------------------------------------------------
 * From a clean, synced `develop`: resolve a GitHub issue (picker,
 * create, or `--issue <n>`), record `.git/CURRENT_ISSUE`, then
 * `git flow release start <x.y.z>`.
 *
 * HOW TO RUN:
 *   npm run git:flow:release:start -- 1.2.0
 *   npm run git:flow:release:start -- --issue 42 1.2.0
 *   node .devenv/tools/git-flow/release/start.mjs 1.2.0
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow release branch.
 *
 * @module git-flow-release-start
 *
 * @example
 * //   npm run git:flow:release:start -- 1.2.0
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError, logInfo } from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";
import {
  parseIssueFlagArgs,
  requireCleanSyncedBase,
  resolveLinkedIssue,
  writeCurrentIssue,
} from "../start-gates.mjs";

/**
 * Issue gate + `git flow release start …`.
 *
 * @param {string[]} [args] - `<x.y.z>` plus optional `--issue <n>`.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await startRelease(["1.2.0"]);
 */
export async function startRelease(args = []) {
  if (!requireCleanSyncedBase("develop").ok) {
    return { ok: false };
  }

  const { issueFlag, rest } = parseIssueFlagArgs(args);
  if (rest.length === 0) {
    logError("Pass <x.y.z>.");
    return { ok: false };
  }

  const linked = await resolveLinkedIssue({ issueFlag });
  if (!linked.ok || !linked.number) {
    return { ok: false };
  }
  if (!writeCurrentIssue(linked.number).ok) {
    return { ok: false };
  }

  logInfo(`Starting release/${rest[0]} (issue #${linked.number})`);
  return runGitFlow("release", "start", rest);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚀 release start");
  if (!(await startRelease(forwardedArgs())).ok) {
    process.exit(1);
  }
  boxDone("release start");
}
