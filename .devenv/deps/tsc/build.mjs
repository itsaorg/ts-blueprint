#!/usr/bin/env node

/** ==============================================================
 * 🏗️ Build
 * ---------------------------------------------------------------
 * Fresh compile pipeline: runs `clean:dist` to remove the old
 * `dist/` tree, then `tsc:emit` to write JavaScript and
 * declarations. Use this when stale emit files would confuse
 * packaging or consumers.
 *
 * HOW TO RUN:
 *   npm run tsc:build
 *   node .devenv/deps/tsc/build.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `tsc:build` — `clean:dist` then `tsc:emit`.
 *
 * @module tsc-build
 *
 * @example
 * // Clean dist/ then emit a fresh build:
 * //   npm run tsc:build
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

logGo("clean:dist");
let code = runNpmScript("clean:dist");
if (code !== 0) {
  logError("tsc:build failed at clean:dist");
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
