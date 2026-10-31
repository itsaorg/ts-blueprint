#!/usr/bin/env node

/** ==============================================================
 * 🔐 npm whoami
 * ---------------------------------------------------------------
 * Prints the logged-in npm user via npm whoami.
 *
 * HOW TO RUN:
 *   node .devenv/tools/npm/auth/whoami.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `npm whoami`.
 *
 * @module npm-auth-whoami
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logOk, run } from "../../../lib/tool-lib.mjs";

/**
 * @typedef {{ ok: true, user: string } | { ok: false }} NpmWhoamiResult
 */

/**
 * Runs `npm whoami`.
 *
 * @returns {NpmWhoamiResult} Username when authenticated.
 */
export function npmWhoami() {
  logGo("npm whoami");
  try {
    const user = run("npm whoami", { inherit: false });
    logOk(`npm whoami: ${user}`);
    return { ok: true, user };
  } catch {
    logError("npm whoami failed (not authenticated)");
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 npm whoami");
  if (!npmWhoami().ok) {
    process.exit(1);
  }
  boxDone("npm whoami");
}
