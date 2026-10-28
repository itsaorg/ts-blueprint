#!/usr/bin/env node

/** ==============================================================
 * 🧪 Vitest coverage
 * ---------------------------------------------------------------
 * Runs Vitest with coverage.
 *
 * HOW TO RUN:
 *   npm run vitest:coverage
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `vitest:coverage` — Runs Vitest with coverage.
 *
 * @module vitest-coverage
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
