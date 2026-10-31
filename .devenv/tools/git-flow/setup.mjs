#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow setup
 * ---------------------------------------------------------------
 * Ensures Git Flow AVH is present and initialized for main/develop.
 * Idempotent. Skips when git-flow is missing. Never installs it.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/setup.mjs
 *   npm run git-flow:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates Git Flow install check and init for this repository.
 *
 * @module git-flow-setup
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logOk, logSkip, run } from "../../lib/tool-lib.mjs";
import { isGitFlowInstalled } from "./isInstalled.mjs";

const PRODUCTION = "main";
const DEVELOP = "develop";

/**
 * Reads a local git config value, or empty string.
 *
 * @param {string} key - Config key.
 * @returns {string} Value or "".
 */
function getLocal(key) {
  try {
    return run(`git config --local --get ${key}`, { inherit: false });
  } catch {
    return "";
  }
}

/**
 * Ensures git-flow is initialized with main/develop.
 *
 * @returns {{ ok: boolean, initialized: boolean }} Outcome summary.
 */
export function setupGitFlow() {
  const installed = isGitFlowInstalled();
  if (!installed.ok) {
    logSkip("git-flow missing. Skipping init.");
    return { ok: false, initialized: false };
  }

  const master = getLocal("gitflow.branch.master");
  const develop = getLocal("gitflow.branch.develop");
  if (master && develop) {
    logSkip(`git-flow already initialized (master=${master}, develop=${develop})`);
    return { ok: true, initialized: true };
  }

  logGo(`git flow init for ${PRODUCTION}/${DEVELOP}`);
  try {
    run(`git config --local gitflow.branch.master ${PRODUCTION}`);
    run(`git config --local gitflow.branch.develop ${DEVELOP}`);
    run("git flow init -d");
    logOk(`git-flow initialized (master=${PRODUCTION}, develop=${DEVELOP})`);
    return { ok: true, initialized: true };
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    return { ok: false, initialized: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌿 git-flow setup");
  setupGitFlow();
  boxDone("git-flow setup");
}
