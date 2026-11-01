#!/usr/bin/env node

/** ==============================================================
 * 🚀 npm release
 * ---------------------------------------------------------------
 * Local/CI release helper: run `tsc:build`, then hand off to
 * `npm:publish:worker` (publish-if-missing). Stops on the first
 * non-zero exit. Does not bump versions — use changesets for that.
 *
 * HOW TO RUN:
 *   npm run npm:release
 *   node .devenv/tools/npm/publish/release.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `npm:release` — `tsc:build` then `npm:publish:worker`.
 *
 * @module npm-release
 *
 * @example
 * // Build + publish-if-missing:
 * //   npm run npm:release
 */

import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  readPackageIdentity,
  runNpmScript,
} from "../../../lib/tool-lib.mjs";

const { name, version } = readPackageIdentity();
boxBanner(`▶️  npm:release — ${name}@${version}`);

logGo("tsc:build");
let code = runNpmScript("tsc:build");
if (code !== 0) {
  logError("npm:release failed at tsc:build");
  process.exitCode = code;
  process.exit(code);
}

logGo("npm:publish:worker");
code = runNpmScript("npm:publish:worker");
if (code !== 0) {
  logError("npm:release failed at npm:publish:worker");
  process.exitCode = code;
  process.exit(code);
}

boxDone("npm:release");
process.exitCode = 0;
