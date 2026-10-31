#!/usr/bin/env node

/** ==============================================================
 * 🐙 GitHub CLI setup
 * ---------------------------------------------------------------
 * Ensures gh is installed and authenticated, then syncs labels.
 * Idempotent. Skips auth/login and labels in CI when appropriate.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/setup.mjs
 *   npm run gh:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates GitHub CLI auth and label sync for this repository.
 *
 * @module gh-setup
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
