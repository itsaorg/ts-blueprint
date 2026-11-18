#!/usr/bin/env node

/** ==============================================================
 * 🛠️ Git setup
 * ---------------------------------------------------------------
 * One-shot entry for this repo's git basics: ensure `git` is on
 * PATH, then set local `commit.template`. Idempotent. Soft-skips
 * configure when git is missing so `prepare` can continue. Never
 * installs git for you and never writes global user identity.
 *
 * HOW TO RUN:
 *   npm run git:setup
 *   node .devenv/tools/git/setup.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates git install check and local configure.
 *
 * Thin wrapper used by `prepare` and the `git:setup` npm script.
 *
 * @module git-setup
 *
 * @example
 * // From package.json: "git:setup": "node .devenv/tools/git/setup.mjs"
 * import { setupGit } from "./setup.mjs";
 * setupGit();
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logSkip } from "../../lib/tool-lib.mjs";
import { configureGit } from "./configure.mjs";
import { isGitInstalled } from "./isInstalled.mjs";

/**
 * Runs git install check then configure.
 *
 * @returns {{ ok: boolean }} Outcome summary.
 *
 * @example
 * const result = setupGit();
 * if (!result.ok) {
 *   // Missing git — prepare soft-skips; CLI may still exit 1 here.
 * }
 */
export function setupGit() {
  const installed = isGitInstalled();
  if (!installed.ok) {
    logSkip("git missing. Skipping configure.");
    return { ok: false };
  }
  const configured = configureGit();
  return { ok: configured.ok };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔧 git setup");
  const result = setupGit();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git setup");
}
