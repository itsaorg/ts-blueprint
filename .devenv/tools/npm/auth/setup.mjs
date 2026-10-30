#!/usr/bin/env node

/** ==============================================================
 * 🔐 npm auth
 * ---------------------------------------------------------------
 * Logs npm whoami. Starts npm login on a TTY when logged out.
 * Skips in CI. Does not run npm:trust.
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

boxBanner("🔐 npm auth");
if (process.env.CI || process.env.GITHUB_ACTIONS) {
  logSkip("CI. Skipping npm login.");
  process.exit(0);
}

try {
  const user = run("npm whoami", { inherit: false });
  logOk(`npm whoami: ${user}`);
  boxDone("npm auth");
  process.exit(0);
} catch {
  logGo("npm is not authenticated");
}

if (!isInteractive()) {
  logSkip("No TTY. Skipping npm login.");
  process.exit(0);
}

try {
  logGo("npm login");
  run("npm login");
  boxDone("npm auth");
} catch {
  logError("npm login failed");
  process.exit(1);
}
