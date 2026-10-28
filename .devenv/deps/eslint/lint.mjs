#!/usr/bin/env node

/** ==============================================================
 * 🧹 ESLint
 * ---------------------------------------------------------------
 * Lints the repository.
 *
 * HOW TO RUN:
 *   npm run eslint:lint
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `eslint:lint` — Lints the repository.
 *
 * @module eslint-lint
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [".", "--config", "configs/eslint.config.js"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "eslint:lint",
  bin: "eslint",
  args,
});
