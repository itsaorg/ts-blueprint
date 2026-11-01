#!/usr/bin/env node

/** ==============================================================
 * 🚪 npm logout
 * ---------------------------------------------------------------
 * Clears the current npm registry session (`npm logout`). Useful
 * when switching accounts or cleaning a shared machine. Does not
 * touch package.json. Fails loudly if logout itself errors.
 *
 * HOW TO RUN:
 *   node .devenv/tools/npm/auth/logout.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `npm logout`.
 *
 * @module npm-auth-logout
 *
 * @example
 * //   node .devenv/tools/npm/auth/logout.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logOk, run } from "../../../lib/tool-lib.mjs";

/**
 * Runs `npm logout`.
 *
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * if (!npmLogout().ok) {
 *   // Logout failed — check registry config / network.
 * }
 */
export function npmLogout() {
  logGo("npm logout");
  try {
    run("npm logout");
    logOk("npm logout finished");
    return { ok: true };
  } catch {
    logError("npm logout failed");
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 npm logout");
  if (!npmLogout().ok) {
    process.exit(1);
  }
  boxDone("npm logout");
}
