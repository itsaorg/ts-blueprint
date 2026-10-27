#!/usr/bin/env node

/** ==============================================================
 * 👀 Preview pull request
 * ---------------------------------------------------------------
 * Logs the gh pr create command and does not open the pull request.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/pr-preview.mjs
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
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, logGo } from "../../lib/tool-lib.mjs";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "pr-create.mjs");
boxBanner("👀 preview pull request");
logGo("DRY_RUN pr-create");
const result = spawnSync(process.execPath, [script], {
  stdio: "inherit",
  env: { ...process.env, DRY_RUN: "true" },
});
process.exit(result.status ?? 1);
