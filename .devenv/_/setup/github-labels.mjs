#!/usr/bin/env node

/** ==============================================================
 * 🏷️ GitHub labels
 * ---------------------------------------------------------------
 * Entry point that syncs .github/labels.json.
 *
 * HOW TO RUN:
 *   npm run setup:labels
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Syncs repository labels.
 *
 * @module github-labels
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, logGo, repoRoot } from "../lib/tool-lib.mjs";

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../devenv/gh/labels-sync.mjs",
);
boxBanner("🏷️ github labels");
logGo("labels-sync");
const result = spawnSync(process.execPath, [script], { cwd: repoRoot, stdio: "inherit" });
process.exit(result.status ?? 1);
