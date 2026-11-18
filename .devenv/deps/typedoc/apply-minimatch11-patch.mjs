#!/usr/bin/env node

/** ==============================================================
 * 🩹 TypeDoc minimatch 11 patch
 * ---------------------------------------------------------------
 * npm overrides force minimatch >=11.0.1 for GHSA-g3hv-75wg-m249.
 * TypeDoc 0.28 still calls removed Minimatch#matchOne. This script
 * idempotently rewrites that call to use a partial Minimatch.
 * Remove when TypeDoc supports minimatch 11 natively.
 *
 * HOW TO RUN:
 *   node .devenv/deps/typedoc/apply-minimatch11-patch.mjs
 *   (also invoked from typedoc:build and prepare)
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Patches TypeDoc for minimatch 11 compatibility.
 *
 * @module typedoc-minimatch11-patch
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logInfo, logOk, logSkip, repoRoot } from "../../lib/tool-lib.mjs";

const TARGET = path.join(repoRoot, "node_modules", "typedoc", "dist", "node-utils.js");

const NEEDLE = "mini.matchOne(";
const MARKER = "minimatch 11 removed matchOne";

const FROM = `function glob(pattern, root, options = {}) {
  const mini = new Minimatch2(pattern);
  const shouldIncludeNodeModules = pattern.includes("node_modules");
  const controller = {
    matches(path) {
      return mini.match(path);
    },
    shouldRecurse(childPath) {
      if (childPath[childPath.length - 1] === "node_modules" && !shouldIncludeNodeModules) {
        return false;
      }
      return mini.set.some((row) => mini.matchOne(
        childPath,
        row,
        /* partial */
        true
      ));
    },`;

const TO = `function glob(pattern, root, options = {}) {
  const mini = new Minimatch2(pattern);
  const miniPartial = new Minimatch2(pattern, { partial: true });
  const shouldIncludeNodeModules = pattern.includes("node_modules");
  const controller = {
    matches(path) {
      return mini.match(path);
    },
    shouldRecurse(childPath) {
      if (childPath[childPath.length - 1] === "node_modules" && !shouldIncludeNodeModules) {
        return false;
      }
      // minimatch 11 removed matchOne; use partial Minimatch instead
      return miniPartial.match(childPath.join("/"));
    },`;

/**
 * Applies the TypeDoc glob patch when needed.
 *
 * @returns {boolean} True when the file is patched (or already patched).
 */
export function applyTypedocMinimatch11Patch() {
  if (!existsSync(TARGET)) {
    logSkip("typedoc not installed; skip minimatch 11 patch");
    return false;
  }
  const source = readFileSync(TARGET, "utf8");
  if (source.includes(MARKER)) {
    logSkip("typedoc minimatch 11 patch already applied");
    return true;
  }
  if (!source.includes(NEEDLE)) {
    logInfo("typedoc no longer uses matchOne; patch not needed (upstream may have fixed this)");
    return true;
  }
  if (!source.includes(FROM)) {
    throw new Error(
      `typedoc glob() shape changed; update ${path.relative(repoRoot, fileURLToPath(import.meta.url))}`,
    );
  }
  writeFileSync(TARGET, source.replace(FROM, TO), "utf8");
  logOk("applied typedoc minimatch 11 patch");
  return true;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  applyTypedocMinimatch11Patch();
}
