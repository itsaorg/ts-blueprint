#!/usr/bin/env node

/** ==============================================================
 * 🔐 gh auth switch
 * ---------------------------------------------------------------
 * Switches the active GitHub account.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/auth/switch.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `gh auth switch`.
 *
 * @module gh-auth-switch
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
 * Runs `gh auth switch` with optional flags.
 *
 * @param {{ args?: string[] }} [options] - Extra argv after `gh auth switch`.
 * @returns {{ ok: boolean }} Outcome.
 */
export function ghAuthSwitch(options = {}) {
  const args = ["auth", "switch", ...(options.args ?? [])];
  logGo(`gh ${args.join(" ")}`);
  const result = spawnSync("gh", args, { cwd: repoRoot, stdio: "inherit" });
  if ((result.status ?? 1) !== 0) {
    logError("gh auth switch failed");
    return { ok: false };
  }
  logOk("gh auth switch finished");
  return { ok: true };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 gh auth switch");
  if (!ghAuthSwitch({ args: forwardedArgs() }).ok) {
    process.exit(1);
  }
  boxDone("gh auth switch");
}
