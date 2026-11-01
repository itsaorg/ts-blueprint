#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow setup
 * ---------------------------------------------------------------
 * One-shot entry for this repo's Git Flow conventions: ensure AVH
 * is present, then initialize (or repair) main/develop prefixes.
 * Idempotent. Soft-skips when git-flow is missing so `prepare` can
 * continue. Never installs Git Flow for you.
 *
 * HOW TO RUN:
 *   npm run git-flow:setup
 *   node .devenv/tools/git-flow/setup.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates Git Flow install check and init for this repository.
 *
 * Thin wrapper around {@link initGitFlow} used by `prepare` and the
 * `git-flow:setup` npm script.
 *
 * @module git-flow-setup
 *
 * @example
 * // From package.json: "git-flow:setup": "node .devenv/tools/git-flow/setup.mjs"
 * import { setupGitFlow } from "./setup.mjs";
 * setupGitFlow();
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone } from "../../lib/tool-lib.mjs";
import { initGitFlow } from "./init.mjs";

/**
 * Ensures git-flow is installed and initialized.
 *
 * @returns {{ ok: boolean, initialized: boolean }} Outcome summary.
 *
 * @example
 * const result = setupGitFlow();
 * if (!result.ok) {
 *   // Missing AVH — prepare soft-skips; CLI may still exit 0 here.
 * }
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
