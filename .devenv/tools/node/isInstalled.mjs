#!/usr/bin/env node

/** ==============================================================
 * 🟢 Node check
 * ---------------------------------------------------------------
 * Reports whether node and npm are on PATH.
 *
 * HOW TO RUN:
 *   node .devenv/tools/node/isInstalled.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Verifies that node and npm are on PATH.
 *
 * @module node-is-installed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logError, logGo, logOk, run } from "../../lib/tool-lib.mjs";

/**
 * @typedef {{ ok: true, node: string, npm: string } | { ok: false }} NodeInstalledResult
 */

/**
 * Checks whether `node` and `npm` are on PATH.
 *
 * @returns {NodeInstalledResult} Versions when installed.
 */
export function isNodeInstalled() {
  logGo("node --version");
  logGo("npm --version");
  try {
    const node = run("node --version", { inherit: false });
    const npm = run("npm --version", { inherit: false });
    logOk(`node ${node}`);
    logOk(`npm ${npm}`);
    return { ok: true, node, npm };
  } catch {
    logError("node or npm is not installed");
    return { ok: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🟢 node check");
  const result = isNodeInstalled();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("node check");
}
