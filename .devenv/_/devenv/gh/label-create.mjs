#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Create labels
 * ---------------------------------------------------------------
 * Entry point that reads a labels JSON path and syncs each label.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/label-create.mjs .github/labels.json
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Reads a labels file and delegates to process-labels.
 *
 * @module label-create
 */

import { boxBanner, boxDone, logError, logInfo } from "../../lib/tool-lib.mjs";
import { processLabels } from "./process-labels.mjs";

const file = process.argv[2] || ".github/labels.json";
boxBanner("🏷️ label create");
try {
  const summary = processLabels(file);
  logInfo(
    `Created ${summary.created}, updated ${summary.updated}, failed ${summary.failed}, total ${summary.total}.`,
  );
  if (summary.failed > 0) {
    process.exit(1);
  }
  boxDone("label create");
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
