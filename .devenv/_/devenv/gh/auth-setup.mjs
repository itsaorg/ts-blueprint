#!/usr/bin/env node

/** ==============================================================
 * 🔐 GitHub CLI auth
 * ---------------------------------------------------------------
 * Logs gh auth status. Starts gh auth login on a TTY when logged out.
 * Skips in CI.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/auth-setup.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Authenticates the GitHub CLI when needed.
 *
 * @module gh-auth-setup
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
} from "../../lib/tool-lib.mjs";

boxBanner("🔐 gh auth");
if (process.env.CI || process.env.GITHUB_ACTIONS) {
  logSkip("CI. Skipping gh auth login.");
  process.exit(0);
}

try {
  const status = run("gh auth status", { inherit: false });
  logOk(status.split(/\r?\n/)[0] || "already authenticated");
  boxDone("gh auth");
  process.exit(0);
} catch {
  logGo("gh is not authenticated");
}

if (!isInteractive()) {
  logError("Refusing gh auth login without a TTY.");
  process.exit(1);
}

try {
  logGo("gh auth login");
  run("gh auth login");
  boxDone("gh auth");
} catch {
  logError("gh auth login failed");
  process.exit(1);
}
