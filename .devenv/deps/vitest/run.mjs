#!/usr/bin/env node

/** ==============================================================
 * 🧪 Vitest run
 * ---------------------------------------------------------------
 * Runs Vitest once.
 *
 * HOW TO RUN:
 *   npm run vitest:run
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `vitest:run` — Runs Vitest once.
 *
 * @module vitest-run
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--config", "configs/vitest.config.ts", "--run"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "vitest:run",
  bin: "vitest",
  args,
});
