#!/usr/bin/env node

/** ==============================================================
 * 👀 Preview issue
 * ---------------------------------------------------------------
 * Logs the gh issue create command and does not create the issue.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/issue-preview.mjs
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
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, logGo } from "../../lib/tool-lib.mjs";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "issue-create.mjs");
boxBanner("👀 preview issue");
logGo("DRY_RUN issue-create");
const result = spawnSync(process.execPath, [script], {
  stdio: "inherit",
  env: { ...process.env, DRY_RUN: "true" },
});
process.exit(result.status ?? 1);
