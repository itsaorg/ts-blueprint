#!/usr/bin/env node

/** ==============================================================
 * 🧪 Vitest verbose
 * ---------------------------------------------------------------
 * Runs Vitest once with the verbose reporter.
 *
 * HOW TO RUN:
 *   npm run vitest:verbose
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `vitest:verbose` — Runs Vitest once with the verbose reporter.
 *
 * @module vitest-verbose
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
