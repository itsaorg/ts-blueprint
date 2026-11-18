#!/usr/bin/env node

/** ==============================================================
 * 🧰 GitHub CLI setup
 * ---------------------------------------------------------------
 * One-shot entry for this repo's GitHub CLI workflow: ensure `gh`
 * is on PATH, ensure auth when a TTY is available, then sync
 * labels from the catalog. Idempotent. Soft-skips missing CLI /
 * CI auth so `prepare` can continue. Never installs `gh` for you.
 *
 * HOW TO RUN:
 *   npm run gh:setup
 *   node .devenv/tools/gh/setup.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates GitHub CLI auth and label sync for this repository.
 *
 * Used by `prepare` and the `gh:setup` npm script.
 *
 * @module gh-setup
 *
 * @example
 * // From package.json: "gh:setup": "node .devenv/tools/gh/setup.mjs"
 * import { setupGh } from "./setup.mjs";
 * setupGh();
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logGo, logSkip } from "../../lib/tool-lib.mjs";
import { ghAuthLogin } from "./auth/login.mjs";
import { ghAuthStatus } from "./auth/status.mjs";
import { isGhInstalled } from "./isInstalled.mjs";
import { syncLabels } from "./label/sync.mjs";

/**
 * Runs gh install check, auth ensure, and label sync.
 *
 * @returns {{ ok: boolean, authenticated: boolean }} Outcome summary.
 *
 * @example
 * const result = setupGh();
 * if (!result.ok) {
 *   // Missing gh — prepare soft-skips; CLI may still exit 1 here.
 * }
 */
export function setupGh() {
  const installed = isGhInstalled();
  if (!installed.ok) {
    logSkip("gh missing. Skipping auth and label sync.");
    return { ok: false, authenticated: false };
  }

  let status = ghAuthStatus();
  if (!status.ok) {
    const login = ghAuthLogin();
    if (login.ok) {
      status = ghAuthStatus();
    }
  }

  if (!status.ok) {
    logSkip("gh is not authenticated. Skipping label sync.");
    return { ok: true, authenticated: false };
  }

  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    logSkip("CI. Skipping label sync.");
    return { ok: true, authenticated: true };
  }

  logGo("sync labels");
  try {
    const summary = syncLabels(".github/labels.json", { requireAuth: false });
    if (summary.failed > 0) {
      logSkip("Some labels failed. Continuing.");
    }
  } catch (error) {
    logSkip(error instanceof Error ? error.message : String(error));
  }

  return { ok: true, authenticated: true };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐙 gh setup");
  setupGh();
  boxDone("gh setup");
}
