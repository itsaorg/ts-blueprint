#!/usr/bin/env node

/** ==============================================================
 * 🔎 Typecheck
 * ---------------------------------------------------------------
 * Runs tsc --noEmit.
 *
 * HOW TO RUN:
 *   npm run tsc:typecheck
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `tsc:typecheck` — Runs tsc --noEmit.
 *
 * @module tsc-typecheck
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--project", "tsconfig.json", "--noEmit", "--pretty"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "tsc:typecheck",
  bin: "tsc",
  args,
});
