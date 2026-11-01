#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow setup
 * ---------------------------------------------------------------
 * Ensures Git Flow AVH is present and initialized for main/develop.
 * Idempotent. Skips when git-flow is missing. Never installs it.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/setup.mjs
 *   npm run git-flow:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates Git Flow install check and init for this repository.
 *
 * @module git-flow-setup
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone } from "../../lib/tool-lib.mjs";
import { initGitFlow } from "./init.mjs";

/**
 * Ensures git-flow is installed and initialized.
 *
 * @returns {{ ok: boolean, initialized: boolean }} Outcome summary.
 */
export function setupGitFlow() {
  return initGitFlow();
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌿 git-flow setup");
  setupGitFlow();
  boxDone("git-flow setup");
}
