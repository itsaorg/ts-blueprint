#!/usr/bin/env node

/** ==============================================================
 * 🐙 GitHub CLI check
 * ---------------------------------------------------------------
 * Logs whether the gh command is on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/check.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Verifies that the GitHub CLI is installed.
 *
 * @module gh-check
 */

import { boxBanner, boxDone, logError, logOk, run } from "../../lib/tool-lib.mjs";

boxBanner("🐙 gh check");
try {
  const version = run("gh --version", { inherit: false }).split(/\r?\n/)[0];
  logOk(version);
  boxDone("gh check");
} catch {
  logError("gh is not installed");
  process.exit(1);
}
