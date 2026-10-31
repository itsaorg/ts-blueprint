#!/usr/bin/env node

/** ==============================================================
 * 🔐 npm login
 * ---------------------------------------------------------------
 * Logs in to npm. Skips in CI or without a TTY.
 *
 * HOW TO RUN:
 *   node .devenv/tools/npm/auth/login.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `npm login`.
 *
 * @module npm-auth-login
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  isInteractive,
  logError,
  logGo,
  logOk,
  logSkip,
  run,
} from "../../../lib/tool-lib.mjs";

/**
 * @typedef {{ ok: true } | { ok: false, reason: string }} NpmLoginResult
 */

/**
 * Runs `npm login` when interactive and not in CI.
 *
 * @returns {NpmLoginResult} Outcome.
 */
export function npmLogin() {
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    logSkip("CI. Skipping npm login.");
    return { ok: false, reason: "ci" };
  }
  if (!isInteractive()) {
    logSkip("No TTY. Skipping npm login.");
    return { ok: false, reason: "no-tty" };
  }
  logGo("npm login");
  try {
    run("npm login");
    logOk("npm login finished");
    return { ok: true };
  } catch {
    logError("npm login failed");
    return { ok: false, reason: "login-failed" };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 npm login");
  if (!npmLogin().ok) {
    process.exit(1);
  }
  boxDone("npm login");
}
