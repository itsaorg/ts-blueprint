#!/usr/bin/env node

/** ==============================================================
 * 📦 npm setup
 * ---------------------------------------------------------------
 * Ensures you are logged in to npm when a TTY is available. Runs
 * `whoami`, then `login` only if needed. Skips entirely in CI.
 * Does not run `npm:trust` or publish anything. Idempotent.
 *
 * HOW TO RUN:
 *   npm run npm:setup
 *   node .devenv/tools/npm/setup.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates npm auth for this repository.
 *
 * Soft-skips when already authenticated, in CI, or without a TTY.
 * Used by `prepare` and the `npm:setup` npm script.
 *
 * @module npm-setup
 *
 * @example
 * // From package.json: "npm:setup": "node .devenv/tools/npm/setup.mjs"
 * import { setupNpm } from "./setup.mjs";
 * setupNpm();
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logSkip } from "../../lib/tool-lib.mjs";
import { npmLogin } from "./auth/login.mjs";
import { npmWhoami } from "./auth/whoami.mjs";

/**
 * Runs npm auth ensure. Skips in CI.
 *
 * @returns {{ ok: boolean, authenticated: boolean }} Outcome summary.
 *
 * @example
 * const result = setupNpm();
 * if (!result.authenticated) {
 *   // CI / no TTY / login declined — publishing may still fail later.
 * }
 */
export function setupNpm() {
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    logSkip("CI. Skipping npm setup.");
    return { ok: true, authenticated: false };
  }

  const whoami = npmWhoami();
  if (whoami.ok) {
    return { ok: true, authenticated: true };
  }

  const login = npmLogin();
  if (!login.ok) {
    if (login.reason === "no-tty" || login.reason === "ci") {
      return { ok: true, authenticated: false };
    }
    return { ok: false, authenticated: false };
  }

  const again = npmWhoami();
  return { ok: again.ok, authenticated: again.ok };
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
