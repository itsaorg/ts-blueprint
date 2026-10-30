#!/usr/bin/env node

/** ==============================================================
 * 🔧 Git configure
 * ---------------------------------------------------------------
 * Sets this repo's local commit.template to the project template.
 * Does not set user.name or user.email. Idempotent.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git/configure.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Configures local git commit.template for this repository.
 *
 * @module git-configure
 */

import path from "node:path";
import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";

const TEMPLATE = ".github/COMMIT_TEMPLATE/commit.txt";
const templatePath = path.join(repoRoot, TEMPLATE);

boxBanner("🔧 git configure");
logGo(`commit.template → ${TEMPLATE}`);

try {
  let current = "";
  try {
    current = run("git config --local --get commit.template", { inherit: false });
  } catch {
    current = "";
  }
  if (current === TEMPLATE || current === templatePath) {
    logSkip(`commit.template already ${current}`);
    boxDone("git configure");
    process.exit(0);
  }
  run(`git config --local commit.template ${TEMPLATE}`);
  logOk(`commit.template = ${TEMPLATE}`);
  boxDone("git configure");
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
