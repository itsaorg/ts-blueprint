#!/usr/bin/env node

/** ==============================================================
 * 🔧 Git setup
 * ---------------------------------------------------------------
 * Ensures git is installed and local commit.template is set.
 * Idempotent.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git/setup.mjs
 *   npm run git:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates git install check and local configure.
 *
 * @module git-setup
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
