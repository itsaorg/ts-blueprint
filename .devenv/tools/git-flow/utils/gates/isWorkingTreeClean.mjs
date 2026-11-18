#!/usr/bin/env node

/** ==============================================================
 * 🚪 isWorkingTreeClean
 * ---------------------------------------------------------------
 * Whether the working tree has no staged or unstaged changes.
 *
 * HOW TO RUN:
 *   imported by git-flow utils
 *   node .devenv/tools/git-flow/utils/gates/isWorkingTreeClean.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Clean working-tree gate.
 *
 * @module git-flow-gate-is-working-tree-clean
 *
 * @example
 * import { isWorkingTreeClean } from "./isWorkingTreeClean.mjs";
 * isWorkingTreeClean();
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logInfo, run } from "../../../../lib/tool-lib.mjs";

/**
 * Whether the working tree has no staged or unstaged changes.
 *
 * @returns {boolean} True when clean.
 *
 * @example
 * isWorkingTreeClean();
 */
export function isWorkingTreeClean() {
  try {
    const status = run("git status --porcelain", { inherit: false });
    return status.trim() === "";
  } catch {
    return false;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 isWorkingTreeClean");
  logInfo(String(isWorkingTreeClean()));
  boxDone("isWorkingTreeClean");
}
