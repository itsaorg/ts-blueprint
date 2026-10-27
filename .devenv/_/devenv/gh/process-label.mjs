#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Process one label
 * ---------------------------------------------------------------
 * Creates or updates one GitHub label with gh label create --force.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/process-label.mjs --name "name" --color ededed
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Creates or updates a single GitHub label.
 *
 * @module process-label
 */

import { execFileSync } from "node:child_process";
import { boxBanner, boxDone, logError, logOk, repoRoot } from "../../lib/tool-lib.mjs";

/**
 * @param {string[]} args - Arguments after `gh`.
 * @returns {string} Captured stdout.
 */
function gh(args) {
  return execFileSync("gh", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/**
 * Creates or updates one label.
 *
 * @param {{ name: string, description?: string, color?: string }} label - Label fields.
 * @returns {"CREATED" | "UPDATED" | "FAILED"} Status token.
 */
export function processLabel(label) {
  const name = label.name;
  const description = label.description || "";
  const color = String(label.color || "ededed").replace(/^#/, "");
  let exists = false;
  try {
    gh(["label", "view", name]);
    exists = true;
  } catch {
    // Missing label. create --force still creates it.
  }
  try {
    gh(["label", "create", name, "--description", description, "--color", color, "--force"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError(`Failed: ${name} — ${message}`);
    return "FAILED";
  }
  if (exists) {
    logOk(`Updated: ${name}`);
    return "UPDATED";
  }
  logOk(`Created: ${name}`);
  return "CREATED";
}

const isMain = process.argv[1] && process.argv[1].endsWith("process-label.mjs");
if (isMain) {
  const nameFlag = process.argv.indexOf("--name");
  const colorFlag = process.argv.indexOf("--color");
  const descriptionFlag = process.argv.indexOf("--description");
  const name = nameFlag === -1 ? "" : process.argv[nameFlag + 1];
  boxBanner("🏷️ process label");
  if (!name) {
    logError("Pass --name <label>.");
    process.exit(1);
  }
  const status = processLabel({
    name,
    description: descriptionFlag === -1 ? "" : process.argv[descriptionFlag + 1] || "",
    color: colorFlag === -1 ? "ededed" : process.argv[colorFlag + 1],
  });
  console.log(status);
  if (status === "FAILED") {
    process.exit(1);
  }
  boxDone("process label");
}
