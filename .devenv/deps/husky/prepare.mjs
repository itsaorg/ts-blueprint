#!/usr/bin/env node

/** ==============================================================
 * 🐶 Husky prepare
 * ---------------------------------------------------------------
 * Installs git hooks from .husky.
 *
 * HOW TO RUN:
 *   npm run husky:prepare
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `husky:prepare` — Installs git hooks from .husky.
 *
 * @module husky-prepare
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [].concat(forwardedArgs());
process.exitCode = runTool({
  label: "husky:prepare",
  bin: "husky",
  args,
});
