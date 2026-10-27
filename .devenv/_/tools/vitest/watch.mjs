#!/usr/bin/env node

/** ==============================================================
 * 🧪 Vitest watch
 * ---------------------------------------------------------------
 * Runs Vitest in watch mode.
 *
 * HOW TO RUN:
 *   npm run vitest
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `vitest` — Runs Vitest in watch mode.
 *
 * @module vitest
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--config", "configs/vitest.config.ts"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "vitest",
  bin: "vitest",
  args,
});
