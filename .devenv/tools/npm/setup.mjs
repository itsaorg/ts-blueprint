#!/usr/bin/env node

/** ==============================================================
 * 📦 npm setup
 * ---------------------------------------------------------------
 * Ensures npm auth when appropriate. Does not run npm:trust.
 * Idempotent. Skips in CI.
 *
 * HOW TO RUN:
 *   node .devenv/tools/npm/setup.mjs
 *   npm run npm:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates npm auth for this repository.
 *
 * @module npm-setup
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logSkip } from "../../lib/tool-lib.mjs";
import { setupNpmAuth } from "./auth/setup.mjs";

/**
 * Runs npm auth ensure. Skips in CI.
 *
 * @returns {{ ok: boolean, authenticated: boolean }} Outcome summary.
 */
export function setupNpm() {
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    logSkip("CI. Skipping npm setup.");
    return { ok: true, authenticated: false };
  }
  return setupNpmAuth();
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📦 npm setup");
  const result = setupNpm();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("npm setup");
}
