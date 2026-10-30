#!/usr/bin/env node

/** ==============================================================
 * 🔧 Git check
 * ---------------------------------------------------------------
 * Reports whether git is on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git/isInstalled.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Verifies that git is on PATH.
 *
 * @module git-is-installed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logOk, run } from "../../lib/tool-lib.mjs";

/**
 * @typedef {{ ok: true, version: string } | { ok: false }} GitInstalledResult
 */

/**
 * Checks whether `git` is on PATH.
 *
 * @returns {GitInstalledResult} Version when installed.
 */
export function isGitInstalled() {
  logGo("git --version");
  try {
    const version = run("git --version", { inherit: false });
    logOk(version);
    return { ok: true, version };
  } catch {
    logError("git is not installed");
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔧 git check");
  const result = isGitInstalled();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git check");
}
