#!/usr/bin/env node

/** ==============================================================
 * 🔐 gh auth login
 * ---------------------------------------------------------------
 * Logs in to a GitHub account. Skips in CI or without a TTY.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/auth/login.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `gh auth login`.
 *
 * @module gh-auth-login
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  isInteractive,
  logError,
  logGo,
  logOk,
  logSkip,
  repoRoot,
} from "../../../lib/tool-lib.mjs";

/**
 * @typedef {{ ok: true } | { ok: false, reason: string }} GhAuthLoginResult
 */

/**
 * Runs `gh auth login` with optional flags when interactive.
 *
 * @param {{ args?: string[] }} [options] - Extra argv after `gh auth login`.
 * @returns {GhAuthLoginResult} Outcome.
 */
export function ghAuthLogin(options = {}) {
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    logSkip("CI. Skipping gh auth login.");
    return { ok: false, reason: "ci" };
  }
  if (!isInteractive()) {
    logSkip("No TTY. Skipping gh auth login.");
    return { ok: false, reason: "no-tty" };
  }
  const args = ["auth", "login", ...(options.args ?? [])];
  logGo(`gh ${args.join(" ")}`);
  const result = spawnSync("gh", args, { cwd: repoRoot, stdio: "inherit" });
  if ((result.status ?? 1) !== 0) {
    logError("gh auth login failed");
    return { ok: false, reason: "failed" };
  }
  logOk("gh auth login finished");
  return { ok: true };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 gh auth login");
  const result = ghAuthLogin({ args: forwardedArgs() });
  if (!result.ok && result.reason === "failed") {
    process.exit(1);
  }
  boxDone("gh auth login");
}
