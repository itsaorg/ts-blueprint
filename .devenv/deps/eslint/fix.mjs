#!/usr/bin/env node

/** ==============================================================
 * 🧹 ESLint fix
 * ---------------------------------------------------------------
 * Lints and autofixes.
 *
 * HOW TO RUN:
 *   npm run eslint:fix
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `eslint:fix` — Lints and autofixes.
 *
 * @module eslint-fix
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [".", "--config", "configs/eslint.config.js", "--fix"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "eslint:fix",
  bin: "eslint",
  args,
});
