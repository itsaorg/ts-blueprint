#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Sync labels
 * ---------------------------------------------------------------
 * Syncs a labels JSON file to the GitHub repository.
 *
 * HOW TO RUN:
 *   npm run gh:label:sync
 *   node .devenv/tools/gh/label/sync.mjs .github/labels.json
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Syncs every label in a JSON catalog.
 *
 * @module label-sync
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  logInfo,
  logOk,
  repoRoot,
} from "../../../lib/tool-lib.mjs";
import { ghAuthStatus } from "../auth/status.mjs";
import { createLabel } from "./create.mjs";
import { readLabel } from "./read.mjs";

/**
 * Upserts one label (read then create --force).
 *
 * @param {{ name: string, description?: string, color?: string }} label - Label fields.
 * @returns {"CREATED" | "UPDATED" | "FAILED"} Status token.
 */
function upsertLabel(label) {
  const name = label.name;
  logGo(`Upsert label: ${name}`);
  const existing = readLabel(name);
  const status = createLabel(label);
  if (status === "FAILED") {
    return "FAILED";
  }
  if (existing) {
    logOk(`Updated: ${name}`);
    return "UPDATED";
  }
  logOk(`Created: ${name}`);
  return "CREATED";
}

/**
 * Syncs labels from a JSON file.
 *
 * @param {string} [labelsFile=".github/labels.json"] - Repo-relative or absolute path.
 * @param {{ requireAuth?: boolean }} [options] - When requireAuth is true (default), check gh auth first.
 * @returns {{ created: number, updated: number, failed: number, total: number }} Counts.
 */
export function syncLabels(labelsFile = ".github/labels.json", options = {}) {
  const requireAuth = options.requireAuth !== false;
  if (requireAuth) {
    const auth = ghAuthStatus();
    if (!auth.ok) {
      throw new Error("gh is not authenticated. Run: node .devenv/tools/gh/auth/login.mjs");
    }
  }

  const labelsPath = path.isAbsolute(labelsFile) ? labelsFile : path.join(repoRoot, labelsFile);
  logGo(`Read labels file: ${labelsPath}`);
  const labels = JSON.parse(readFileSync(labelsPath, "utf8"));
  if (!Array.isArray(labels)) {
    throw new Error("labels file must contain an array");
  }

  const summary = { created: 0, updated: 0, failed: 0, total: labels.length };
  for (const label of labels) {
    const status = upsertLabel(label);
    logInfo(`${label.name}: ${status}`);
    if (status === "CREATED") {
      summary.created += 1;
    } else if (status === "UPDATED") {
      summary.updated += 1;
    } else {
      summary.failed += 1;
    }
  }
  logInfo(
    `Created ${summary.created}, updated ${summary.updated}, failed ${summary.failed}, total ${summary.total}.`,
  );
  return summary;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ sync labels");
  try {
    const file = process.argv[2] || ".github/labels.json";
    const summary = syncLabels(file);
    if (summary.failed > 0) {
      process.exit(1);
    }
    boxDone("sync labels");
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
