#!/usr/bin/env node

/** ==============================================================
 * 🪄 lint-staged
 * ---------------------------------------------------------------
 * Runs Prettier and ESLint on staged files.
 *
 * HOW TO RUN:
 *   npm run lint-staged
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `lint-staged` — Runs Prettier and ESLint on staged files.
 *
 * @module lint-staged
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [].concat(forwardedArgs());
process.exitCode = runTool({
  label: "lint-staged",
  bin: "lint-staged",
  args,
});
