#!/usr/bin/env node

/** ==============================================================
 * 🔐 gh auth setup-git
 * ---------------------------------------------------------------
 * Configures git to use GitHub CLI as a credential helper.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/auth/setup-git.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `gh auth setup-git`.
 *
 * @module gh-auth-setup-git
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logGo,
  logOk,
  repoRoot,
} from "../../../lib/tool-lib.mjs";

/**
 * Runs `gh auth setup-git` with optional flags.
 *
 * @param {{ args?: string[] }} [options] - Extra argv after `gh auth setup-git`.
 * @returns {{ ok: boolean }} Outcome.
 */
export function ghAuthSetupGit(options = {}) {
  const args = ["auth", "setup-git", ...(options.args ?? [])];
  logGo(`gh ${args.join(" ")}`);
  const result = spawnSync("gh", args, { cwd: repoRoot, stdio: "inherit" });
  if ((result.status ?? 1) !== 0) {
    logError("gh auth setup-git failed");
    return { ok: false };
  }
  logOk("gh auth setup-git finished");
  return { ok: true };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 gh auth setup-git");
  if (!ghAuthSetupGit({ args: forwardedArgs() }).ok) {
    process.exit(1);
  }
  boxDone("gh auth setup-git");
}
