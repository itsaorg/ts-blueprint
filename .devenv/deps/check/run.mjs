#!/usr/bin/env node

/** ==============================================================
 * ✅ Check
 * ---------------------------------------------------------------
 * Local/CI quality gate. Runs scripts in order: `tsc:typecheck`,
 * `prettier:check`, `eslint:lint`, `layout:check`, `vitest:run`,
 * then `tsc:build`. Stops at the first failure. Does not collect
 * coverage — use `vitest:coverage` separately when you need it.
 *
 * HOW TO RUN:
 *   npm run check
 *   node .devenv/deps/check/run.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `check` — full CI-style gate (no coverage).
 *
 * @module check
 *
 * @example
 * // Run the same gate CI expects before pushing:
 * //   npm run check
 */

import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  logOk,
  readPackageIdentity,
  runNpmScript,
} from "../../lib/tool-lib.mjs";

const steps = [
  "tsc:typecheck",
  "prettier:check",
  "eslint:lint",
  "layout:check",
  "vitest:run",
  "tsc:build",
];

const { name, version } = readPackageIdentity();
boxBanner(`▶️  check — ${name}@${version}`);

for (const script of steps) {
  logGo(script);
  const code = runNpmScript(script);
  if (code !== 0) {
    logError(`check failed at ${script}`);
    process.exitCode = code;
    process.exit(code);
  }
}

logOk(`check passed for ${name}@${version}`);
boxDone("check");
process.exitCode = 0;
