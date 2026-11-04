#!/usr/bin/env node

/** ==============================================================
 * 📣 Vitest verbose
 * ---------------------------------------------------------------
 * Runs Vitest once with the verbose reporter so every test name
 * is printed. Helpful when a failure is hard to spot in the
 * default summary output. Uses `configs/vitest.config.ts`.
 *
 * HOW TO RUN:
 *   npm run vitest:verbose
 *   node .devenv/deps/vitest/verbose.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `vitest:verbose` — single-pass run, verbose reporter.
 *
 * @module vitest-verbose
 *
 * @example
 * // See every test name while debugging a flake:
 * //   npm run vitest:verbose
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--config", "configs/vitest.config.ts", "--run", "--reporter=verbose"].concat(
  forwardedArgs(),
);
process.exitCode = runTool({
  label: "vitest:verbose",
  bin: "vitest",
  args,
});
