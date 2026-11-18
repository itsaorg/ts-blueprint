#!/usr/bin/env node

/** ==============================================================
 * 🎫 gh auth token
 * ---------------------------------------------------------------
 * Prints the authentication token `gh` uses for a host/account.
 * Treat the output as a secret — do not commit or paste into
 * tickets. Forwards extra CLI flags. Prefer OIDC / Trusted
 * Publishing in CI instead of copying tokens by hand.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/auth/token.mjs
 *   node .devenv/tools/gh/auth/token.mjs --hostname github.com
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `gh auth token`.
 *
 * @module gh-auth-token
 *
 * @example
 * // Print token for scripting (keep stdout private):
 * //   node .devenv/tools/gh/auth/token.mjs
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
 * Runs `gh auth token` with optional flags.
 *
 * @param {{ args?: string[] }} [options] - Extra argv after `gh auth token`.
 * @returns {{ ok: true, token: string } | { ok: false }} Outcome.
 *
 * @example
 * const result = ghAuthToken();
 * if (result.ok) {
 *   // Use result.token carefully — never log it.
 * }
 */
export function ghAuthToken(options = {}) {
  const args = ["auth", "token", ...(options.args ?? [])];
  logGo(`gh ${args.join(" ")}`);
  try {
    const token = execFileSync("gh", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    logOk("token retrieved");
    return { ok: true, token };
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 gh auth token");
  const result = ghAuthToken({ args: forwardedArgs() });
  if (!result.ok) {
    process.exit(1);
  }
  console.log(result.token);
  boxDone("gh auth token");
}
