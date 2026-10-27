#!/usr/bin/env node

/** ==============================================================
 * 📁 Repository root
 * ---------------------------------------------------------------
 * Prints the directory that contains package.json.
 *
 * HOW TO RUN:
 *   node .devenv/_/lib/repo-root.mjs
 *   node .devenv/_/lib/repo-root.mjs --json
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Prints the walked-up repository root.
 *
 * @module repo-root
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import { boxBanner, boxDone, findRepoRoot, logInfo } from "./tool-lib.mjs";

const root = findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));
boxBanner("📁 repo root");
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ repoRoot: root }));
} else {
  console.log(root);
}
logInfo(root);
boxDone("repo-root");
