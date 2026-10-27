#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Sync labels
 * ---------------------------------------------------------------
 * Syncs .github/labels.json to the GitHub repository. Does not use jq.
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
 * Syncs the repository label catalog.
 *
 * @module labels-sync
 */

import { boxBanner, boxDone, logError, logInfo, run } from "../../lib/tool-lib.mjs";
import { processLabels } from "./process-labels.mjs";

boxBanner("🏷️ sync labels");
try {
  run("gh auth status", { inherit: false });
} catch {
  logError("gh is not authenticated. Run: node .devenv/_/devenv/gh/auth-setup.mjs");
  process.exit(1);
}

try {
  const summary = processLabels(".github/labels.json");
  logInfo(
    `Created ${summary.created}, updated ${summary.updated}, failed ${summary.failed}, total ${summary.total}.`,
  );
  if (summary.failed > 0) {
    process.exit(1);
  }
  boxDone("sync labels");
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
