#!/usr/bin/env node

/** ==============================================================
 * 📦 Build
 * ---------------------------------------------------------------
 * Deletes dist/, then emits JavaScript and declarations.
 *
 * HOW TO RUN:
 *   npm run tsc:build
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `tsc:build` — `dist:clean` then `tsc:emit`.
 *
 * @module tsc-build
 */

import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  readPackageIdentity,
  runNpmScript,
} from "../../lib/tool-lib.mjs";

const { name, version } = readPackageIdentity();
boxBanner(`▶️  tsc:build — ${name}@${version}`);

logGo("dist:clean");
let code = runNpmScript("dist:clean");
if (code !== 0) {
  logError("tsc:build failed at dist:clean");
  process.exitCode = code;
  process.exit(code);
}

logGo("tsc:emit");
code = runNpmScript("tsc:emit");
if (code !== 0) {
  logError("tsc:build failed at tsc:emit");
  process.exitCode = code;
  process.exit(code);
}

boxDone("tsc:build");
process.exitCode = 0;
