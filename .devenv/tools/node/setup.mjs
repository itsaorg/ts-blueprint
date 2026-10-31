#!/usr/bin/env node

/** ==============================================================
 * 🟢 Node setup
 * ---------------------------------------------------------------
 * Ensures node/npm are on PATH and the Node major matches `.nvmrc`
 * (or engines.node). Idempotent. Soft-skips on mismatch.
 *
 * HOW TO RUN:
 *   node .devenv/tools/node/setup.mjs
 *   npm run node:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates node/npm install and required-version checks.
 *
 * @module node-setup
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logSkip } from "../../lib/tool-lib.mjs";
import { isNodeInstalled } from "./isInstalled.mjs";

/**
 * Runs node/npm check including `.nvmrc` / engines major.
 *
 * @returns {{ ok: boolean, node?: string, npm?: string }} Outcome summary.
 */
export function setupNode() {
  const installed = isNodeInstalled();
  if (!installed.ok) {
    logSkip("node setup incomplete (missing or wrong version). Continuing.");
    return {
      ok: false,
      node: installed.node,
      npm: installed.npm,
    };
  }
  return { ok: true, node: installed.node, npm: installed.npm };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🟢 node setup");
  setupNode();
  boxDone("node setup");
}
