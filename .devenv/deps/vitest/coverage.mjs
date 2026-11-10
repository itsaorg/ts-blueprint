#!/usr/bin/env node

/** ==============================================================
 * 📊 Vitest coverage
 * ---------------------------------------------------------------
 * Runs Vitest once with coverage collection enabled. Writes a
 * coverage report under `coverage/` (see Vitest config). Not part
 * of the default `check` gate — run it when you want metrics.
 *
 * HOW TO RUN:
 *   npm run vitest:coverage
 *   node .devenv/deps/vitest/coverage.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `vitest:coverage` — single-pass run with coverage.
 *
 * @module vitest-coverage
 *
 * @example
 * // Collect coverage after changing core modules:
 * //   npm run vitest:coverage
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--config", "configs/vitest.config.ts", "--run", "--coverage"].concat(
  forwardedArgs(),
);
process.exitCode = runTool({
  label: "vitest:coverage",
  bin: "vitest",
  args,
});
