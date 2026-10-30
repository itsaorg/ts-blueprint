#!/usr/bin/env node

/** ==============================================================
 * 🔄 Post-clone steps
 * ---------------------------------------------------------------
 * Checks git and Node, then runs npm clean-install (which runs
 * prepare: husky, git configure, gh setup, npm auth).
 *
 * HOW TO RUN:
 *   npm run setup:post-clone
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Prepares a clone via probes then npm clean-install.
 *
 * @module post-clone-run
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, run } from "../lib/tool-lib.mjs";
import { isGitInstalled } from "../tools/git/isInstalled.mjs";
import { isNodeInstalled } from "../tools/node/isInstalled.mjs";

/**
 * Runs the post-clone sequence.
 *
 * @returns {number} Exit code.
 */
export function runPostClone() {
  boxBanner("🔄 post-clone");
  logGo("git check");
  if (!isGitInstalled().ok) {
    logError("git check failed");
    return 1;
  }
  logGo("node check");
  if (!isNodeInstalled().ok) {
    logError("node check failed");
    return 1;
  }
  logGo("npm clean-install");
  try {
    run("npm clean-install");
  } catch {
    logError("npm clean-install failed");
    return 1;
  }
  boxDone("post-clone");
  return 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(runPostClone());
}
