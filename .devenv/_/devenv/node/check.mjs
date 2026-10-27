#!/usr/bin/env node

/** ==============================================================
 * 🟢 Node check
 * ---------------------------------------------------------------
 * Prints the Node.js and npm versions. Exits 1 when either is missing.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/node/check.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Verifies that node and npm are on PATH.
 *
 * @module node-check
 */

import { boxBanner, boxDone, logError, logOk, run } from "../../lib/tool-lib.mjs";

boxBanner("🟢 node check");
try {
  logOk(`node ${run("node --version", { inherit: false })}`);
  logOk(`npm ${run("npm --version", { inherit: false })}`);
  boxDone("node check");
} catch {
  logError("node or npm is not installed");
  process.exit(1);
}
