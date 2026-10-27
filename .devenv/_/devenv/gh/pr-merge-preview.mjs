#!/usr/bin/env node

/** ==============================================================
 * 👀 Preview merge
 * ---------------------------------------------------------------
 * Logs the gh pr merge command and does not merge.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/pr-merge-preview.mjs
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
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, logGo } from "../../lib/tool-lib.mjs";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "pr-merge.mjs");
boxBanner("👀 preview merge");
logGo("DRY_RUN pr-merge");
const result = spawnSync(process.execPath, [script], {
  stdio: "inherit",
  env: { ...process.env, DRY_RUN: "true" },
});
process.exit(result.status ?? 1);
