#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow check
 * ---------------------------------------------------------------
 * Prints the installed Git Flow AVH version. Exits 1 when git-flow
 * is missing. Does not install Git Flow and does not run git config.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/git-flow/check.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Verifies that Git Flow AVH is on PATH.
 *
 * @module git-flow-check
 */

import { boxBanner, boxDone, logError, logOk, run } from "../../lib/tool-lib.mjs";

boxBanner("🌿 git-flow check");
try {
  logOk(run("git flow version", { inherit: false }));
  boxDone("git-flow check");
} catch {
  logError("Git Flow AVH is not installed");
  process.exit(1);
}
