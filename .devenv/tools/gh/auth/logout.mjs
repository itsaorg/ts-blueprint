#!/usr/bin/env node

/** ==============================================================
 * 🚪 gh auth logout
 * ---------------------------------------------------------------
 * Logs out of a GitHub account via `gh auth logout`. Useful when
 * switching machines or clearing a shared session. Forwards extra
 * CLI flags. Does not delete repositories or tokens on GitHub.com
 * beyond what `gh` itself removes locally.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/auth/logout.mjs
 *   node .devenv/tools/gh/auth/logout.mjs --hostname github.com
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Wraps `gh auth logout`.
 *
 * @module gh-auth-logout
 *
 * @example
 * //   node .devenv/tools/gh/auth/logout.mjs
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
 * Runs `gh auth logout` with optional flags.
 *
 * @param {{ args?: string[] }} [options] - Extra argv after `gh auth logout`.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * ghAuthLogout({ args: ["--hostname", "github.com"] });
 */
export function ghAuthLogout(options = {}) {
  const args = ["auth", "logout", ...(options.args ?? [])];
  logGo(`gh ${args.join(" ")}`);
  const result = spawnSync("gh", args, { cwd: repoRoot, stdio: "inherit" });
  if ((result.status ?? 1) !== 0) {
    logError("gh auth logout failed");
    return { ok: false };
  }
  logOk("gh auth logout finished");
  return { ok: true };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔐 gh auth logout");
  if (!ghAuthLogout({ args: forwardedArgs() }).ok) {
    process.exit(1);
  }
  boxDone("gh auth logout");
}
