#!/usr/bin/env node

/** ==============================================================
 * 📖 TypeDoc
 * ---------------------------------------------------------------
 * Generates API docs.
 *
 * HOW TO RUN:
 *   npm run typedoc
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `typedoc` — Generates API docs.
 *
 * @module typedoc
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--options", "configs/typedoc.json"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "typedoc",
  bin: "typedoc",
  args,
});
