#!/usr/bin/env node

/** ==============================================================
 * 🐶 Prepare lifecycle
 * ---------------------------------------------------------------
 * After install: husky, git check + commit.template, gh auth,
 * npm auth, then optional label sync. Idempotent. Skips auth and
 * labels in CI. Does not run npm clean-install or check.
 *
 * HOW TO RUN:
 *   npm run prepare
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Runs the npm prepare sequence for this repository.
 *
 * @module prepare-run
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
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
import { processLabels } from "../tools/gh/label/process-many.mjs";

/**
 * @param {string} script - Absolute script path.
 * @returns {number} Exit code.
 */
function runScript(script) {
  const result = spawnSync(process.execPath, [script], { cwd: repoRoot, stdio: "inherit" });
  return result.status ?? 1;
}

/**
 * Runs the prepare sequence.
 *
 * @returns {number} Exit code.
 */
export function runPrepare() {
  boxBanner("🐶 prepare");

  logGo("husky:prepare");
  const hooks = runNpmScript("husky:prepare");
  if (hooks !== 0) {
    logError("husky:prepare failed");
    return hooks;
  }

  logGo("git isInstalled");
  if (runScript(path.join(repoRoot, ".devenv/tools/git/isInstalled.mjs")) !== 0) {
    logError("git isInstalled failed");
    return 1;
  }

  logGo("git configure");
  if (runScript(path.join(repoRoot, ".devenv/tools/git/configure.mjs")) !== 0) {
    logError("git configure failed");
    return 1;
  }

  const inCi = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
  let ghReady = false;

  logGo("gh isInstalled");
  if (runScript(path.join(repoRoot, ".devenv/tools/gh/isInstalled.mjs")) !== 0) {
    logSkip("gh missing. Skipping gh auth and label sync.");
  } else {
    logGo("gh auth");
    runScript(path.join(repoRoot, ".devenv/tools/gh/auth/setup.mjs"));
    if (!inCi) {
      try {
        run("gh auth status", { inherit: false });
        ghReady = true;
      } catch {
        logSkip("gh is not authenticated. Skipping label sync.");
      }
    } else {
      logSkip("CI. Skipping label sync.");
    }
  }

  logGo("npm auth");
  runScript(path.join(repoRoot, ".devenv/tools/npm/auth/setup.mjs"));

  if (ghReady) {
    logGo("sync labels");
    try {
      const summary = processLabels(".github/labels.json");
      if (summary.failed > 0) {
        logSkip("Some labels failed. Continuing.");
      }
    } catch (error) {
      logSkip(error instanceof Error ? error.message : String(error));
    }
  }

  boxDone("prepare");
  return 0;
}

const isMain = process.argv[1] && process.argv[1].endsWith("prepare-run.mjs");
if (isMain) {
  process.exit(runPrepare());
}
