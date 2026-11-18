#!/usr/bin/env node

/** ==============================================================
 * 🐙 GitHub CLI check
 * ---------------------------------------------------------------
 * Reports whether the `gh` command is on PATH and prints the
 * first version line. Does not install the CLI and does not touch
 * auth. Other gh tools call this first so they can soft-skip.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/isInstalled.mjs
 *   npm run gh:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Verifies that the GitHub CLI is installed.
 *
 * Used by `setupGh` / `gh:setup` before auth and label sync. CLI
 * exits 1 when `gh` is missing.
 *
 * @module gh-is-installed
 *
 * @example
 * // CLI check (exits 1 when missing):
 * //   node .devenv/tools/gh/isInstalled.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logOk, run } from "../../lib/tool-lib.mjs";

/**
 * @typedef {{ ok: true, version: string } | { ok: false }} GhInstalledResult
 */

/**
 * Checks whether `gh` is on PATH.
 *
 * @returns {GhInstalledResult} Version when installed.
 *
 * @example
 * const result = isGhInstalled();
 * if (!result.ok) {
 *   // Soft-skip auth/labels; or exit 1 from CLI main.
 * }
 */
export function isGhInstalled() {
  logGo("gh --version");
  try {
    const version = run("gh --version", { inherit: false }).split(/\r?\n/)[0];
    logOk(version);
    return { ok: true, version };
  } catch {
    logError("gh is not installed");
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐙 gh check");
  const result = isGhInstalled();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("gh check");
}
