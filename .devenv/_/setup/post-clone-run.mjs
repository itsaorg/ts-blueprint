#!/usr/bin/env node

/** ==============================================================
 * 🔄 Post-clone steps
 * ---------------------------------------------------------------
 * Checks git and Node, runs npm ci and husky:prepare, then optionally
 * checks gh and syncs labels. Does not run git config.
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
 * Prepares a clone without changing git config.
 *
 * @module post-clone-run
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  logSkip,
  repoRoot,
  run,
  runNpmScript,
} from "../lib/tool-lib.mjs";
import { processLabels } from "../devenv/gh/process-labels.mjs";

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
  if (runScript(path.join(repoRoot, ".devenv/_/devenv/git/check.mjs")) !== 0) {
    logError("git check failed");
    return 1;
  }
  logGo("node check");
  if (runScript(path.join(here, "../devenv/node/check.mjs")) !== 0) {
    logError("node check failed");
    return 1;
  }
  logGo("npm ci");
  try {
    run("npm ci");
  } catch {
    logError("npm ci failed");
    return 1;
  }
  logGo("husky:prepare");
  const hooks = runNpmScript("husky:prepare");
  if (hooks !== 0) {
    logError("husky:prepare failed");
    return hooks;
  }
  logGo("gh check");
  if (runScript(path.join(repoRoot, ".devenv/_/devenv/gh/check.mjs")) !== 0) {
    logSkip("gh check skipped.");
  } else if (process.env.CI || process.env.GITHUB_ACTIONS) {
    logSkip("CI. Skipping gh auth and label sync.");
  } else {
    try {
      run("gh auth status", { inherit: false });
      logGo("sync labels");
      const summary = processLabels(".github/labels.json");
      if (summary.failed > 0) {
        logSkip("Some labels failed. Continuing.");
      }
    } catch {
      logSkip("gh is not authenticated. Skipping label sync.");
    }
  }
  boxDone("post-clone");
  return 0;
}

const isMain = process.argv[1] && process.argv[1].endsWith("post-clone-run.mjs");
if (isMain) {
  process.exit(runPostClone());
}
