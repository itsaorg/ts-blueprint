#!/usr/bin/env node

/** ==============================================================
 * 🚪 parseAheadBehind
 * ---------------------------------------------------------------
 * Parses ahead/behind counts from
 * `git rev-list --left-right --count` stdout.
 *
 * HOW TO RUN:
 *   imported by git-flow utils
 *   node .devenv/tools/git-flow/utils/gates/parseAheadBehind.mjs "0\t0"
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Ahead/behind parser.
 *
 * @module git-flow-gate-parse-ahead-behind
 *
 * @example
 * import { parseAheadBehind } from "./parseAheadBehind.mjs";
 * parseAheadBehind("0\t0"); // { ahead: 0, behind: 0 }
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logInfo } from "../../../../lib/tool-lib.mjs";

/**
 * Parses ahead/behind counts from `git rev-list --left-right --count`.
 *
 * @param {string} raw - stdout like "0\t0" or "1 0".
 * @returns {{ ahead: number, behind: number } | null} Counts, or null.
 *
 * @example
 * parseAheadBehind("0\t0"); // { ahead: 0, behind: 0 }
 */
export function parseAheadBehind(raw) {
  const match = String(raw ?? "")
    .trim()
    .match(/^(\d+)\s+(\d+)$/);
  if (!match) {
    return null;
  }
  return { ahead: Number(match[1]), behind: Number(match[2]) };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 parseAheadBehind");
  const [raw] = forwardedArgs();
  logInfo(JSON.stringify(parseAheadBehind(raw || "")));
  boxDone("parseAheadBehind");
}
