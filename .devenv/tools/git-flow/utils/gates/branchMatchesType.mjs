#!/usr/bin/env node

/** ==============================================================
 * 🚪 branchMatchesType
 * ---------------------------------------------------------------
 * Pure check: whether a branch name starts with `type/`.
 *
 * HOW TO RUN:
 *   imported by git-flow utils
 *   node .devenv/tools/git-flow/utils/gates/branchMatchesType.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Type-prefix match for a branch name.
 *
 * @module git-flow-gate-branch-matches-type
 *
 * @example
 * import { branchMatchesType } from "./branchMatchesType.mjs";
 * branchMatchesType("feature/42-x", "feature"); // true
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logInfo } from "../../../../lib/tool-lib.mjs";

/**
 * Whether `branch` matches the Git Flow type prefix.
 *
 * @param {string} branch - Full branch name.
 * @param {string} type - Type prefix without slash.
 * @returns {boolean} True when branch starts with `type/`.
 *
 * @example
 * branchMatchesType("feature/42-x", "feature"); // true
 * branchMatchesType("bugfix/1-y", "feature"); // false
 */
export function branchMatchesType(branch, type) {
  return String(branch ?? "").startsWith(`${type}/`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 branchMatchesType");
  const [branch, type] = forwardedArgs();
  logInfo(String(branchMatchesType(branch || "", type || "")));
  boxDone("branchMatchesType");
}
