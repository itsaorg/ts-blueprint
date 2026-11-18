#!/usr/bin/env node

/** ==============================================================
 * 🪞 Preview merge
 * ---------------------------------------------------------------
 * Dry-run wrapper: spawns `pr/merge.mjs` with `DRY_RUN=true` so
 * you can inspect the `gh pr merge` command without merging.
 * Safe to re-run; no GitHub writes.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/pr/merge-preview.mjs
 *   DRY_RUN=true node .devenv/tools/gh/pr/merge.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Runs pull-request merge in dry-run mode.
 *
 * @module pr-merge-preview
 *
 * @example
 * //   node .devenv/tools/gh/pr/merge-preview.mjs
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, logGo } from "../../../lib/tool-lib.mjs";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "merge.mjs");
boxBanner("👀 preview merge");
logGo("DRY_RUN pr-merge");
const result = spawnSync(process.execPath, [script], {
  stdio: "inherit",
  env: { ...process.env, DRY_RUN: "true" },
});
process.exit(result.status ?? 1);
