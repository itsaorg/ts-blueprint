#!/usr/bin/env node

/** ==============================================================
 * 🟢 Node check
 * ---------------------------------------------------------------
 * Reports whether node and npm are on PATH and whether the Node
 * major matches `.nvmrc` when present (else package.json
 * engines.node).
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
 * Verifies that node and npm are on PATH and match the required major.
 *
 * @module node-is-installed
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  logInfo,
  logOk,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";

/**
 * @typedef {{ ok: true, node: string, npm: string, expected: string | null, source: string | null }
 *   | { ok: false, node?: string, npm?: string, expected?: string | null, source?: string | null }} NodeInstalledResult
 */

/**
 * Digits of a version-ish string (first number group).
 *
 * @param {string} value - Version text.
 * @returns {string | null} Major digits or null.
 */
function majorOf(value) {
  const match = String(value).match(/\d+/);
  return match ? match[0] : null;
}

/**
 * Required Node major from `.nvmrc` or `engines.node`.
 *
 * @returns {{ expected: string, source: string } | null} Requirement when found.
 */
export function requiredNodeMajor() {
  const nvmrcPath = path.join(repoRoot, ".nvmrc");
  if (existsSync(nvmrcPath)) {
    const raw = readFileSync(nvmrcPath, "utf8").trim();
    const expected = majorOf(raw);
    if (expected) {
      return { expected, source: ".nvmrc" };
    }
  }
  try {
    const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
    const engines = pkg.engines?.node;
    if (typeof engines === "string" && engines) {
      const expected = majorOf(engines);
      if (expected) {
        return { expected, source: "package.json engines.node" };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Checks whether `node` and `npm` are on PATH and match the required major.
 *
 * @returns {NodeInstalledResult} Versions and requirement outcome.
 */
export function isNodeInstalled() {
  logGo("node --version");
  logGo("npm --version");
  /** @type {string} */
  let node;
  /** @type {string} */
  let npm;
  try {
    node = run("node --version", { inherit: false });
    npm = run("npm --version", { inherit: false });
    logOk(`node ${node}`);
    logOk(`npm ${npm}`);
  } catch {
    logError("node or npm is not installed");
    return { ok: false };
  }

  const requirement = requiredNodeMajor();
  if (!requirement) {
    logInfo("No .nvmrc or engines.node requirement found");
    return { ok: true, node, npm, expected: null, source: null };
  }

  const actual = majorOf(node);
  logGo(`Required Node major ${requirement.expected} (${requirement.source})`);
  if (actual !== requirement.expected) {
    logError(
      `Node major ${actual ?? "unknown"} does not match required ${requirement.expected} from ${requirement.source}`,
    );
    return {
      ok: false,
      node,
      npm,
      expected: requirement.expected,
      source: requirement.source,
    };
  }
  logOk(`Node major ${actual} matches ${requirement.source}`);
  return {
    ok: true,
    node,
    npm,
    expected: requirement.expected,
    source: requirement.source,
  };
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
