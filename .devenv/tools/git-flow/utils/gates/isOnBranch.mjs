#!/usr/bin/env node

/** ==============================================================
 * 🚪 isOnBranch
 * ---------------------------------------------------------------
 * Whether HEAD equals the given branch name.
 *
 * HOW TO RUN:
 *   imported by git-flow utils
 *   node .devenv/tools/git-flow/utils/gates/isOnBranch.mjs develop
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * HEAD equality gate.
 *
 * @module git-flow-gate-is-on-branch
 *
 * @example
 * import { isOnBranch } from "./isOnBranch.mjs";
 * isOnBranch("develop");
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logInfo } from "../../../../lib/tool-lib.mjs";
import { headBranch } from "./headBranch.mjs";

/**
 * Whether HEAD equals `name`.
 *
 * @param {string} name - Expected branch name.
 * @returns {boolean} True when on that branch.
 *
 * @example
 * isOnBranch("develop");
 */
export function isOnBranch(name) {
  const head = headBranch();
  return Boolean(head) && head === name;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 isOnBranch");
  const [name] = forwardedArgs();
  logInfo(String(isOnBranch(name || "")));
  boxDone("isOnBranch");
}
