#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Read one label
 * ---------------------------------------------------------------
 * Reads a GitHub label by listing labels and matching on name.
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
} from "../../../lib/tool-lib.mjs";
import { listLabels } from "./list.mjs";

/**
 * @typedef {{ name: string, description: string, color: string }} LabelFields
 */

/**
 * Reads one label by name via listLabels().
 *
 * @param {string} name - Label name.
 * @returns {LabelFields | null} Fields when found.
 */
export function readLabel(name) {
  logGo(`Lookup label: ${name}`);
  try {
    const match = listLabels().find((entry) => entry.name === name);
    if (!match) {
      logSkip(`Label not found: ${name}`);
      return null;
    }
    logOk(`Found label: ${match.name}`);
    return match;
  } catch {
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
