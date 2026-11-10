#!/usr/bin/env node

/** ==============================================================
 * 📊 gh auth status
 * ---------------------------------------------------------------
 * Displays the active GitHub account and authentication state via
 * `gh auth status`. Read-only probe used by setup before login.
 * Parses a login name when present. Forwards extra CLI flags.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/auth/status.mjs
 *   node .devenv/tools/gh/auth/status.mjs --hostname github.com
 *   npm run gh:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `gh auth status`.
 *
 * @module gh-auth-status
 *
 * @example
 * //   node .devenv/tools/gh/auth/status.mjs
 */

import { execFileSync } from "node:child_process";
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
 * @typedef {{ ok: true, output: string, login: string | null } | { ok: false, output?: string }} GhAuthStatusResult
 */

/**
 * Runs `gh auth status` with optional flags.
 *
 * @param {{ args?: string[] }} [options] - Extra argv after `gh auth status`.
 * @returns {GhAuthStatusResult} Status payload.
 *
 * @example
 * const status = ghAuthStatus();
 * if (status.ok) {
 *   console.log(status.login);
 * }
 */
export function ghAuthStatus(options = {}) {
  const args = ["auth", "status", ...(options.args ?? [])];
  logGo(`gh ${args.join(" ")}`);
  try {
    const output = execFileSync("gh", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    const loginMatch = output.match(/Logged in to \S+ account (\S+)/);
    const login = loginMatch ? loginMatch[1] : null;
    logOk(output.split(/\r?\n/)[0] || "authenticated");
    if (login) {
      logOk(`Active account: ${login}`);
    }
    return { ok: true, output, login };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    return { ok: false, output: message };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 gh auth status");
  const result = ghAuthStatus({ args: forwardedArgs() });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("gh auth status");
}
