#!/usr/bin/env node

/** ==============================================================
 * 🛟 Support branch start
 * ---------------------------------------------------------------
 * Clean working tree, resolve a GitHub issue (picker/create or
 * `--issue <n>`), record `.git/CURRENT_ISSUE`, then
 * `git flow support start <name> <base>`.
 *
 * HOW TO RUN:
 *   npm run git:flow:support:start -- 1.x v1.2.0
 *   npm run git:flow:support:start -- --issue 42 1.x v1.2.0
 *   node .devenv/tools/git-flow/support/start.mjs 1.x v1.2.0
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Starts a Git Flow support branch.
 *
 * @module git-flow-support-start
 *
 * @example
 * //   npm run git:flow:support:start -- 1.x v1.2.0
 */

import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  isInteractive,
  logError,
  logInfo,
} from "../../../lib/tool-lib.mjs";
import { runGitFlow } from "../command.mjs";
import {
  parseIssueFlagArgs,
  requireCleanWorkingTree,
  resolveLinkedIssue,
  writeCurrentIssue,
} from "../start-gates.mjs";

/**
 * Asks for a required CLI argument when running on a TTY.
 *
 * @param {string} label - Prompt label.
 * @returns {Promise<string>} Trimmed answer (may be empty).
 */
async function askRequired(label) {
  const rl = readline.createInterface({ input, output });
  try {
    return (await rl.question(`❓ ${label}: `)).trim();
  } finally {
    rl.close();
  }
}

/**
 * Resolves `<name> <base>` from argv or interactive prompts.
 *
 * @param {string[]} [args] - CLI args (without `--issue`).
 * @returns {Promise<{ ok: boolean, args?: string[] }>} Resolved pair.
 */
export async function resolveSupportStartArgs(args = []) {
  let name = args[0] || "";
  let base = args[1] || "";

  if (!name && isInteractive()) {
    name = await askRequired("Support branch name (e.g. 1.x)");
  }
  if (!base && isInteractive()) {
    base = await askRequired("Base ref (tag or branch, e.g. v1.2.0)");
  }

  if (!name || !base) {
    logError("Pass <name> <base> (e.g. 1.x v1.2.0).");
    logInfo("Example: npm run git:flow:support:start -- 1.x v1.2.0");
    return { ok: false };
  }
  return { ok: true, args: [name, base] };
}

/**
 * Issue gate + `git flow support start …`.
 *
 * @param {string[]} [args] - `<name> <base>` plus optional `--issue <n>`.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await startSupport(["1.x", "v1.2.0"]);
 */
export async function startSupport(args = []) {
  if (!requireCleanWorkingTree().ok) {
    return { ok: false };
  }

  const { issueFlag, rest } = parseIssueFlagArgs(args);
  const linked = await resolveLinkedIssue({ issueFlag });
  if (!linked.ok || !linked.number) {
    return { ok: false };
  }
  if (!writeCurrentIssue(linked.number).ok) {
    return { ok: false };
  }

  const resolved = await resolveSupportStartArgs(rest);
  if (!resolved.ok || !resolved.args) {
    return { ok: false };
  }

  logInfo(`Starting support/${resolved.args[0]} (issue #${linked.number})`);
  return runGitFlow("support", "start", resolved.args);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🛟 support start");
  const result = await startSupport(forwardedArgs());
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("support start");
}
