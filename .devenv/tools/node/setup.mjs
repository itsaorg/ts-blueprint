#!/usr/bin/env node

/** ==============================================================
 * 🟦 Node setup
 * ---------------------------------------------------------------
 * One-shot entry for this repo's Node requirement: ensure `node`
 * is on PATH and the major matches `.nvmrc` (or `engines.node`).
 * Idempotent. Soft-skips on missing/wrong version so `prepare`
 * can continue. Never installs or switches Node for you.
 *
 * HOW TO RUN:
 *   npm run node:setup
 *   node .devenv/tools/node/setup.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Orchestrates node install and required-version checks.
 *
 * Thin wrapper around {@link isNodeInstalled} used by `prepare`
 * and the `node:setup` npm script. Soft-skips on failure.
 *
 * @module node-setup
 *
 * @example
 * // From package.json: "node:setup": "node .devenv/tools/node/setup.mjs"
 * import { setupNode } from "./setup.mjs";
 * setupNode();
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logSkip } from "../../lib/tool-lib.mjs";
import { isNodeInstalled } from "./isInstalled.mjs";

/**
 * Runs node check including `.nvmrc` / engines major.
 *
 * @returns {{ ok: boolean, node?: string }} Outcome summary.
 *
 * @example
 * const result = setupNode();
 * if (!result.ok) {
 *   // Missing/wrong Node — prepare soft-skips; CLI still exits 0.
 * }
 */
export function setupNode() {
  const installed = isNodeInstalled();
  if (!installed.ok) {
    logSkip("node setup incomplete (missing or wrong version). Continuing.");
    return { ok: false, node: installed.node };
  }
  return { ok: true, node: installed.node };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🟢 node setup");
  setupNode();
  boxDone("node setup");
}
