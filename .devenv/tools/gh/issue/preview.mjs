#!/usr/bin/env node

/** ==============================================================
 * 👀 Preview issue
 * ---------------------------------------------------------------
 * Dry-run wrapper: spawns `issue/create.mjs` with `DRY_RUN=true`
 * so you can inspect the `gh issue create` command without
 * opening a real issue. Safe to re-run; no GitHub writes.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/issue/preview.mjs
 *   DRY_RUN=true node .devenv/tools/gh/issue/create.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Runs issue creation in dry-run mode.
 *
 * @module issue-preview
 *
 * @example
 * //   node .devenv/tools/gh/issue/preview.mjs
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, logGo } from "../../../lib/tool-lib.mjs";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "create.mjs");
boxBanner("👀 preview issue");
logGo("DRY_RUN issue-create");
const result = spawnSync(process.execPath, [script], {
  stdio: "inherit",
  env: { ...process.env, DRY_RUN: "true" },
});
process.exit(result.status ?? 1);
