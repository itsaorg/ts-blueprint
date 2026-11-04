#!/usr/bin/env node

/** ==============================================================
 * 🔑 npm login
 * ---------------------------------------------------------------
 * Runs interactive `npm login` so publish scripts can talk to the
 * registry. Soft-skips in CI or when stdin is not a TTY (no prompt
 * possible). Does not change package.json or publish anything.
 *
 * HOW TO RUN:
 *   node .devenv/tools/npm/auth/login.mjs
 *   npm run npm:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `npm login` with CI / non-TTY guards.
 *
 * @module npm-auth-login
 *
 * @example
 * //   node .devenv/tools/npm/auth/login.mjs
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
 *
 * @example
 * const result = npmLogin();
 * if (!result.ok && result.reason === "no-tty") {
 *   // Soft-skip — caller may continue without auth.
 * }
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
