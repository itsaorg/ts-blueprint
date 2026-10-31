#!/usr/bin/env node

/** ==============================================================
 * 🏷️ List repository labels
 * ---------------------------------------------------------------
 * Lists GitHub label names with gh label list --json.
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
 * Lists all repository label names.
 *
 * @module label-list
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logOk, repoRoot } from "../../../lib/tool-lib.mjs";

/**
 * Lists every label name on the current repository.
 *
 * @returns {string[]} Label names.
 */
export function listLabels() {
  logGo("gh label list --json name");
  try {
    const raw = execFileSync("gh", ["label", "list", "--json", "name", "--limit", "1000"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) {
      throw new Error("gh label list did not return an array");
    }
    const names = parsed.map((entry) => String(entry.name ?? "")).filter(Boolean);
    logOk(`Listed ${names.length} label(s)`);
    return names;
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
    const names = listLabels();
    console.log(JSON.stringify(names, null, 2));
    boxDone("list labels");
  } catch {
    process.exit(1);
  }
}
