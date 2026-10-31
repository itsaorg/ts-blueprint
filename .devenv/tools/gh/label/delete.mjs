#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Delete one label
 * ---------------------------------------------------------------
 * Deletes a GitHub label with gh label delete --yes.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/label/delete.mjs --name "bug"
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Deletes a single repository label.
 *
 * @module label-delete
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logGo,
  logOk,
  repoRoot,
} from "../../../lib/tool-lib.mjs";

/**
 * Deletes one label by name.
 *
 * @param {string} name - Label name.
 * @returns {"OK" | "FAILED"} Status token.
 */
export function deleteLabel(name) {
  logGo(`gh label delete ${JSON.stringify(name)} --yes`);
  try {
    execFileSync("gh", ["label", "delete", name, "--yes"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    logOk(`Deleted label: ${name}`);
    return "OK";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError(`Failed to delete: ${name} — ${message}`);
    return "FAILED";
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ delete label");
  const args = forwardedArgs();
  const nameFlag = args.indexOf("--name");
  const name = nameFlag === -1 ? "" : args[nameFlag + 1] || "";
  if (!name) {
    logError("Pass --name <label>.");
    process.exit(1);
  }
  const status = deleteLabel(name);
  if (status === "FAILED") {
    process.exit(1);
  }
  boxDone("delete label");
}
