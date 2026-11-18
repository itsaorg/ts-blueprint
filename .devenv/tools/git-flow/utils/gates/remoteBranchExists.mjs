#!/usr/bin/env node

/** ==============================================================
 * 🚪 remoteBranchExists
 * ---------------------------------------------------------------
 * Whether origin has the topic branch (fetch, then `ls-remote`).
 *
 * HOW TO RUN:
 *   imported by git-flow utils
 *   node .devenv/tools/git-flow/utils/gates/remoteBranchExists.mjs feature/42-x
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Remote topic-branch existence gate.
 *
 * @module git-flow-gate-remote-branch-exists
 *
 * @example
 * import { remoteBranchExists } from "./remoteBranchExists.mjs";
 * remoteBranchExists("feature/42-x");
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logInfo, run } from "../../../../lib/tool-lib.mjs";

/**
 * Whether origin has the topic branch (fetch, then `ls-remote`).
 *
 * @param {string} branch - Full branch name.
 * @returns {boolean} True when published on origin.
 *
 * @example
 * remoteBranchExists("feature/42-x");
 */
export function remoteBranchExists(branch) {
  try {
    run("git fetch origin", { inherit: false });
  } catch {
    // continue; may already have refs
  }
  try {
    const raw = run(`git ls-remote --heads origin ${JSON.stringify(branch)}`, {
      inherit: false,
    });
    return Boolean(String(raw || "").trim());
  } catch {
    try {
      run(`git rev-parse --verify origin/${branch}`, { inherit: false });
      return true;
    } catch {
      return false;
    }
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 remoteBranchExists");
  const [branch] = forwardedArgs();
  logInfo(String(remoteBranchExists(branch || "")));
  boxDone("remoteBranchExists");
}
