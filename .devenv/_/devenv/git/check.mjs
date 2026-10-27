#!/usr/bin/env node

/** ==============================================================
 * 🔧 Git check
 * ---------------------------------------------------------------
 * Prints the installed Git version. Exits 1 when git is missing.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/git/check.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Verifies that git is on PATH.
 *
 * @module git-check
 */

import { boxBanner, boxDone, logError, logOk, run } from "../../lib/tool-lib.mjs";

boxBanner("🔧 git check");
try {
  logOk(run("git --version", { inherit: false }));
  boxDone("git check");
} catch {
  logError("git is not installed");
  process.exit(1);
}
