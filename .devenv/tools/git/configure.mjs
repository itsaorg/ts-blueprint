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
import { fileURLToPath } from "node:url";
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

/**
 * Sets local commit.template when needed.
 *
 * @returns {{ ok: boolean, skipped?: boolean }} Outcome.
 */
export function configureGit() {
  const templatePath = path.join(repoRoot, TEMPLATE);
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
      return { ok: true, skipped: true };
    }
    run(`git config --local commit.template ${TEMPLATE}`);
    logOk(`commit.template = ${TEMPLATE}`);
    return { ok: true, skipped: false };
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔧 git configure");
  const result = configureGit();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git configure");
}
