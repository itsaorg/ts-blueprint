#!/usr/bin/env node

/** ==============================================================
 * ✅ Check
 * ---------------------------------------------------------------
 * CI gate. Order: tsc:typecheck, prettier:check, eslint:lint,
 * layout:check, vitest:run, tsc:build. Does not collect coverage.
 *
 * HOW TO RUN:
 *   npm run check
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `check` — CI gate (no vitest:coverage).
 *
 * @module check
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
