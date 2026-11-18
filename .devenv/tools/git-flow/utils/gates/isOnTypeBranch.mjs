#!/usr/bin/env node

/** ==============================================================
 * 🚪 isOnTypeBranch
 * ---------------------------------------------------------------
 * Whether HEAD is a `type/` topic branch.
 *
 * HOW TO RUN:
 *   imported by git-flow utils
 *   node .devenv/tools/git-flow/utils/gates/isOnTypeBranch.mjs feature
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * HEAD type-prefix gate.
 *
 * @module git-flow-gate-is-on-type-branch
 *
 * @example
 * import { isOnTypeBranch } from "./isOnTypeBranch.mjs";
 * isOnTypeBranch("feature");
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logInfo } from "../../../../lib/tool-lib.mjs";
import { branchMatchesType } from "./branchMatchesType.mjs";
import { headBranch } from "./headBranch.mjs";

/**
 * Whether HEAD is a `type/` topic branch.
 *
 * @param {string} type - Branch type.
 * @returns {boolean} True when on `type/…`.
 *
 * @example
 * isOnTypeBranch("feature");
 */
export function isOnTypeBranch(type) {
  return branchMatchesType(headBranch(), type);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 isOnTypeBranch");
  const [type] = forwardedArgs();
  logInfo(String(isOnTypeBranch(type || "")));
  boxDone("isOnTypeBranch");
}
