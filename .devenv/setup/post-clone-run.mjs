#!/usr/bin/env node

/** ==============================================================
 * 🔄 Post-clone steps
 * ---------------------------------------------------------------
 * Checks git and Node, then runs npm clean-install (which runs
 * prepare: husky, git configure, gh/npm auth, labels).
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

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, repoRoot, run } from "../lib/tool-lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} script - Script path.
 * @returns {number} Exit code.
 */
function runScript(script) {
  const result = spawnSync(process.execPath, [script], { cwd: repoRoot, stdio: "inherit" });
  return result.status ?? 1;
}

/**
 * Runs the post-clone sequence.
 *
 * @returns {number} Exit code.
 */
export function runPostClone() {
  boxBanner("🔄 post-clone");
  logGo("git check");
  if (runScript(path.join(repoRoot, ".devenv/tools/git/isInstalled.mjs")) !== 0) {
    logError("git check failed");
    return 1;
  }
  logGo("node check");
  if (runScript(path.join(here, "../tools/node/isInstalled.mjs")) !== 0) {
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

const isMain = process.argv[1] && process.argv[1].endsWith("post-clone-run.mjs");
if (isMain) {
  process.exit(runPostClone());
}
