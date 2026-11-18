#!/usr/bin/env node

/** ==============================================================
 * 👁️ Preview pull request
 * ---------------------------------------------------------------
 * Dry-run wrapper: spawns `pr/create.mjs` with `DRY_RUN=true` so
 * you can inspect the `gh pr create` command without opening a
 * real PR. Safe to re-run; no GitHub writes.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/pr/preview.mjs
 *   DRY_RUN=true node .devenv/tools/gh/pr/create.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Runs pull-request creation in dry-run mode.
 *
 * @module pr-preview
 *
 * @example
 * //   node .devenv/tools/gh/pr/preview.mjs
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, logGo } from "../../../lib/tool-lib.mjs";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "create.mjs");
boxBanner("👀 preview pull request");
logGo("DRY_RUN pr-create");
const result = spawnSync(process.execPath, [script], {
  stdio: "inherit",
  env: { ...process.env, DRY_RUN: "true" },
});
process.exit(result.status ?? 1);
