#!/usr/bin/env node

/** ==============================================================
 * 📦 Emit
 * ---------------------------------------------------------------
 * Runs tsc and writes dist/.
 *
 * HOW TO RUN:
 *   npm run tsc:emit
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `tsc:emit` — Runs tsc and writes dist/.
 *
 * @module tsc-emit
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--project", "tsconfig.json", "--pretty"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "tsc:emit",
  bin: "tsc",
  args,
});
