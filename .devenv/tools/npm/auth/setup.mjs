#!/usr/bin/env node

/** ==============================================================
 * 🔐 npm auth
 * ---------------------------------------------------------------
 * Logs npm whoami. Starts npm login on a TTY when logged out.
 * Skips in CI. Does not run npm:trust. Idempotent.
 *
 * HOW TO RUN:
 *   node .devenv/tools/npm/auth/setup.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Authenticates npm when needed.
 *
 * @module npm-auth-setup
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
 * Ensures npm auth on a TTY when not in CI.
 *
 * @returns {{ ok: boolean, authenticated: boolean }} Outcome.
 */
export function setupNpmAuth() {
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    logSkip("CI. Skipping npm login.");
    return { ok: true, authenticated: false };
  }

  try {
    const user = run("npm whoami", { inherit: false });
    logOk(`npm whoami: ${user}`);
    return { ok: true, authenticated: true };
  } catch {
    logGo("npm is not authenticated");
  }

  if (!isInteractive()) {
    logSkip("No TTY. Skipping npm login.");
    return { ok: true, authenticated: false };
  }

  try {
    logGo("npm login");
    run("npm login");
    return { ok: true, authenticated: true };
  } catch {
    logError("npm login failed");
    return { ok: false, authenticated: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 npm auth");
  const result = setupNpmAuth();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("npm auth");
}
