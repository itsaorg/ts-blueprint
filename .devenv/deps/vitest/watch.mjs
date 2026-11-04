#!/usr/bin/env node

/** ==============================================================
 * 🔄 Vitest watch
 * ---------------------------------------------------------------
 * Starts Vitest in watch mode so tests re-run as you edit. This
 * is the default `npm run vitest` entry for local development.
 * Uses `configs/vitest.config.ts`. Stop with Ctrl+C when done.
 *
 * HOW TO RUN:
 *   npm run vitest
 *   node .devenv/deps/vitest/watch.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `vitest` — interactive watch-mode test runner.
 *
 * @module vitest
 *
 * @example
 * // Keep tests re-running while you code:
 * //   npm run vitest
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--config", "configs/vitest.config.ts"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "vitest",
  bin: "vitest",
  args,
});
