#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow init
 * ---------------------------------------------------------------
 * Initializes Git Flow AVH for main/develop. Idempotent.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/init.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Initializes Git Flow for this repository.
 *
 * @module git-flow-init
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
 * @returns {{ ok: boolean, initialized: boolean, skipped?: boolean }} Outcome.
 */
export function initGitFlow() {
  const installed = isGitFlowInstalled();
  if (!installed.ok) {
    logSkip("git-flow missing. Skipping init.");
    return { ok: false, initialized: false };
  }

  const master = getLocal("gitflow.branch.master");
  const develop = getLocal("gitflow.branch.develop");
  if (master && develop) {
    logSkip(`git-flow already initialized (master=${master}, develop=${develop})`);
    return { ok: true, initialized: true, skipped: true };
  }

  logGo(`git flow init for ${PRODUCTION}/${DEVELOP}`);
  try {
    run(`git config --local gitflow.branch.master ${PRODUCTION}`);
    run(`git config --local gitflow.branch.develop ${DEVELOP}`);
    run("git flow init -d");
    logOk(`git-flow initialized (master=${PRODUCTION}, develop=${DEVELOP})`);
    return { ok: true, initialized: true, skipped: false };
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    return { ok: false, initialized: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌿 git-flow init");
  const result = initGitFlow();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git-flow init");
}
