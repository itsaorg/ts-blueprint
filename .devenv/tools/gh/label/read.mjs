#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Read one label
 * ---------------------------------------------------------------
 * Reads a GitHub label by listing labels and matching on name.
 * (gh label view is unavailable on older gh releases.)
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/label/read.mjs --name "🐞 Bug Report"
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Reads a single repository label.
 *
 * @module label-read
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
  logSkip,
  repoRoot,
} from "../../../lib/tool-lib.mjs";

/**
 * @typedef {{ name: string, description: string, color: string }} LabelFields
 */

/**
 * Reads one label by name via `gh label list --json`.
 *
 * @param {string} name - Label name.
 * @returns {LabelFields | null} Fields when found.
 */
export function readLabel(name) {
  logGo(`Lookup label: ${name}`);
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
    const match = parsed.find((entry) => String(entry.name ?? "") === name);
    if (!match) {
      logSkip(`Label not found: ${name}`);
      return null;
    }
    logOk(`Found label: ${match.name}`);
    return {
      name: String(match.name ?? name),
      description: String(match.description ?? ""),
      color: String(match.color ?? "ededed").replace(/^#/, ""),
    };
  } catch (error) {
    if (error && typeof error === "object" && "status" in error) {
      logSkip(`Label not found: ${name}`);
      return null;
    }
    logSkip(`Label not found: ${name}`);
    return null;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ read label");
  const args = forwardedArgs();
  const nameFlag = args.indexOf("--name");
  const name = nameFlag === -1 ? "" : args[nameFlag + 1] || "";
  if (!name) {
    logError("Pass --name <label>.");
    process.exit(1);
  }
  const label = readLabel(name);
  if (!label) {
    process.exit(1);
  }
  console.log(JSON.stringify(label, null, 2));
  boxDone("read label");
}
