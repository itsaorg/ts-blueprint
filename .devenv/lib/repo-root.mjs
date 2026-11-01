#!/usr/bin/env node

/** ==============================================================
 * 📁 Repository root printer
 * ---------------------------------------------------------------
 * Walks upward from this file until `package.json` is found, then
 * prints that directory. Useful when debugging “where is the repo?”
 * from nested `.devenv` scripts. Pass `--json` for machine output.
 *
 * HOW TO RUN:
 *   node .devenv/lib/repo-root.mjs
 *   node .devenv/lib/repo-root.mjs --json
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * CLI: prints the walked-up repository root.
 *
 * Uses {@link findRepoRoot} from `tool-lib.mjs`. Plain text by default;
 * `{ "repoRoot": "…" }` when `--json` is present.
 *
 * @module repo-root
 *
 * @example
 * // Plain:
 * //   D:\GitHub\itsaorg\…\ts-blueprint
 * // JSON:
 * //   {"repoRoot":"D:\\GitHub\\…\\ts-blueprint"}
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
