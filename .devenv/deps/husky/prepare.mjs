#!/usr/bin/env node

/** ==============================================================
 * 🐶 Husky prepare
 * ---------------------------------------------------------------
 * Installs Husky so git hooks under `.husky/` are wired for this
 * clone. Typically run via the npm `prepare` / `husky:prepare`
 * lifecycle after `npm install`. Safe to re-run if hooks go
 * missing.
 *
 * HOW TO RUN:
 *   npm run husky:prepare
 *   node .devenv/deps/husky/prepare.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `husky:prepare` — installs git hooks from `.husky/`.
 *
 * @module husky-prepare
 *
 * @example
 * // Re-wire hooks after cloning or resetting .husky:
 * //   npm run husky:prepare
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [].concat(forwardedArgs());
process.exitCode = runTool({
  label: "husky:prepare",
  bin: "husky",
  args,
});
