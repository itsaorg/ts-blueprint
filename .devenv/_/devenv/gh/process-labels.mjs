#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Process labels
 * ---------------------------------------------------------------
 * Reads a labels JSON file and creates or updates each label.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/process-labels.mjs .github/labels.json
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Syncs every label in a JSON file.
 *
 * @module process-labels
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { boxBanner, boxDone, logError, logInfo, repoRoot } from "../../lib/tool-lib.mjs";
import { processLabel } from "./process-label.mjs";

/**
 * @param {string} labelsFile - Repo-relative or absolute JSON path.
 * @returns {{ created: number, updated: number, failed: number, total: number }} Counts.
 */
export function processLabels(labelsFile) {
  const labelsPath = path.isAbsolute(labelsFile) ? labelsFile : path.join(repoRoot, labelsFile);
  const labels = JSON.parse(readFileSync(labelsPath, "utf8"));
  if (!Array.isArray(labels)) {
    throw new Error("labels file must contain an array");
  }
  const summary = { created: 0, updated: 0, failed: 0, total: labels.length };
  for (const label of labels) {
    const status = processLabel(label);
    console.log(status);
    if (status === "CREATED") {
      summary.created += 1;
    } else if (status === "UPDATED") {
      summary.updated += 1;
    } else {
      summary.failed += 1;
    }
  }
  return summary;
}

const isMain = process.argv[1] && process.argv[1].endsWith("process-labels.mjs");
if (isMain) {
  const file = process.argv[2] || ".github/labels.json";
  boxBanner("🏷️ process labels");
  try {
    const summary = processLabels(file);
    logInfo(
      `Created ${summary.created}, updated ${summary.updated}, failed ${summary.failed}, total ${summary.total}.`,
    );
    if (summary.failed > 0) {
      process.exit(1);
    }
    boxDone("process labels");
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
