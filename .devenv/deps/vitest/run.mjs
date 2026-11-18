#!/usr/bin/env node

/** ==============================================================
 * 🧪 Vitest run
 * ---------------------------------------------------------------
 * Executes the Vitest suite once (no watch) using
 * `configs/vitest.config.ts`. Suitable for CI and the `check`
 * gate. Pass extra Vitest flags after `--` when needed.
 *
 * HOW TO RUN:
 *   npm run vitest:run
 *   node .devenv/deps/vitest/run.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `vitest:run` — single-pass test run.
 *
 * @module vitest-run
 *
 * @example
 * // Run the suite once and exit:
 * //   npm run vitest:run
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--config", "configs/vitest.config.ts", "--run"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "vitest:run",
  bin: "vitest",
  args,
});
