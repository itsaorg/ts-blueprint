#!/usr/bin/env node

/** ==============================================================
 * 🔐 gh auth refresh
 * ---------------------------------------------------------------
 * Refreshes stored GitHub authentication credentials.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/auth/refresh.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `gh auth refresh`.
 *
 * @module gh-auth-refresh
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
 * Runs `gh auth refresh` with optional flags.
 *
 * @param {{ args?: string[] }} [options] - Extra argv after `gh auth refresh`.
 * @returns {{ ok: boolean }} Outcome.
 */
export function ghAuthRefresh(options = {}) {
  const args = ["auth", "refresh", ...(options.args ?? [])];
  logGo(`gh ${args.join(" ")}`);
  const result = spawnSync("gh", args, { cwd: repoRoot, stdio: "inherit" });
  if ((result.status ?? 1) !== 0) {
    logError("gh auth refresh failed");
    return { ok: false };
  }
  logOk("gh auth refresh finished");
  return { ok: true };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 gh auth refresh");
  if (!ghAuthRefresh({ args: forwardedArgs() }).ok) {
    process.exit(1);
  }
  boxDone("gh auth refresh");
}
