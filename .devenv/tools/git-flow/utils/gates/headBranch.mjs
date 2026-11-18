#!/usr/bin/env node

/** ==============================================================
 * 🚪 headBranch
 * ---------------------------------------------------------------
 * Returns the current HEAD branch name via
 * `git branch --show-current`, or empty string when unavailable.
 *
 * HOW TO RUN:
 *   imported by git-flow utils
 *   node .devenv/tools/git-flow/utils/gates/headBranch.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Current HEAD branch name.
 *
 * @module git-flow-gate-head-branch
 *
 * @example
 * import { headBranch } from "./headBranch.mjs";
 * headBranch(); // "feature/42-add-login"
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logInfo, run } from "../../../../lib/tool-lib.mjs";

/**
 * Current HEAD branch name (`git branch --show-current`).
 *
 * @returns {string} Branch name, or empty string.
 *
 * @example
 * headBranch(); // "feature/42-add-login"
 */
export function headBranch() {
  try {
    return run("git branch --show-current", { inherit: false });
  } catch {
    return "";
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 headBranch");
  logInfo(headBranch() || "(empty)");
  boxDone("headBranch");
}
