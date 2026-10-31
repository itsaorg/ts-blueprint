#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow check
 * ---------------------------------------------------------------
 * Reports whether Git Flow AVH is on PATH. Does not install Git
 * Flow and does not run git config.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/isInstalled.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Verifies that Git Flow AVH is on PATH.
 *
 * @module git-flow-is-installed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logOk, run } from "../../lib/tool-lib.mjs";

/**
 * @typedef {{ ok: true, version: string } | { ok: false }} GitFlowInstalledResult
 */

/**
 * Checks whether `git flow` is on PATH.
 *
 * @returns {GitFlowInstalledResult} Version when installed.
 */
export function isGitFlowInstalled() {
  logGo("git flow version");
  try {
    const version = run("git flow version", { inherit: false });
    logOk(version);
    return { ok: true, version };
  } catch {
    logError("Git Flow AVH is not installed");
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌿 git-flow check");
  const result = isGitFlowInstalled();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git-flow check");
}
