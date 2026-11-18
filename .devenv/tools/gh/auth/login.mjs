#!/usr/bin/env node

/** ==============================================================
 * 🔐 gh auth login
 * ---------------------------------------------------------------
 * Runs interactive `gh auth login` so later gh tools can talk to
 * GitHub. Soft-skips in CI or when stdin is not a TTY. Forwards
 * extra CLI flags after the script name. Does not create issues
 * or PRs by itself.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/auth/login.mjs
 *   npm run gh:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `gh auth login` with CI / non-TTY guards.
 *
 * @module gh-auth-login
 *
 * @example
 * //   node .devenv/tools/gh/auth/login.mjs
 * //   node .devenv/tools/gh/auth/login.mjs --web
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
 *
 * @example
 * ghAuthLogin({ args: ["--web"] });
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
