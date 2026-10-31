#!/usr/bin/env node

/** ==============================================================
 * 🏷️ List repository labels
 * ---------------------------------------------------------------
 * Lists GitHub labels with gh label list --json.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/label/list.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Lists all repository labels.
 *
 * @module label-list
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logOk, repoRoot } from "../../../lib/tool-lib.mjs";

/**
 * @typedef {{ name: string, description: string, color: string }} LabelFields
 */

/**
 * Lists every label on the current repository.
 *
 * @returns {LabelFields[]} Label fields.
 */
export function listLabels() {
  logGo("gh label list --json name,description,color");
  try {
    const raw = execFileSync(
      "gh",
      ["label", "list", "--json", "name,description,color", "--limit", "1000"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).trim();
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) {
      throw new Error("gh label list did not return an array");
    }
    const labels = parsed
      .map((entry) => ({
        name: String(entry.name ?? ""),
        description: String(entry.description ?? ""),
        color: String(entry.color ?? "ededed").replace(/^#/, ""),
      }))
      .filter((entry) => entry.name);
    logOk(`Listed ${labels.length} label(s)`);
    return labels;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError(`Failed to list labels — ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ list labels");
  try {
    const labels = listLabels();
    console.log(JSON.stringify(labels, null, 2));
    boxDone("list labels");
  } catch {
    process.exit(1);
  }
}
