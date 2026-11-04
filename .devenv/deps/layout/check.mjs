#!/usr/bin/env node

/** ==============================================================
 * 📐 Layout check
 * ---------------------------------------------------------------
 * Walks `src/` and fails when a non-`index.ts` file declares more
 * than one principal (class, interface, enum, or type alias).
 * Keeps source files focused and easy to navigate. Part of the
 * `check` gate.
 *
 * HOW TO RUN:
 *   npm run layout:check
 *   node .devenv/deps/layout/check.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `layout:check` — one principal per non-index `.ts` file.
 *
 * @module layout-check
 *
 * @example
 * // Ensure each source file stays single-purpose:
 * //   npm run layout:check
 */

import fs from "node:fs";
import path from "node:path";
import {
  boxBanner,
  boxDone,
  logError,
  logOk,
  readPackageIdentity,
  repoRoot,
} from "../../lib/tool-lib.mjs";

const principals = /^(?:export\s+)?(?:abstract\s+)?(?:class|interface|enum|type)\s+/gm;

/**
 * Walks a directory for TypeScript sources and flags multi-principal files.
 *
 * @param {string} dir - Absolute or repo-relative directory.
 * @returns {void}
 */
function walk(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith(".ts") && entry.name !== "index.ts") {
      const hits = fs.readFileSync(full, "utf8").match(principals) ?? [];
      if (hits.length > 1) {
        logError(`${full} declares ${hits.length} principals`);
        process.exitCode = 1;
      }
    }
  }
}

const { name, version } = readPackageIdentity();
boxBanner(`▶️  layout:check — ${name}@${version}`);
walk(path.join(repoRoot, "src"));
if (process.exitCode) {
  logError("layout:check failed");
  process.exit(process.exitCode);
}
logOk("one principal per source file");
boxDone("layout:check");
