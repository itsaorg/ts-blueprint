#!/usr/bin/env node

/** ==============================================================
 * 👀 Prettier check
 * ---------------------------------------------------------------
 * Verifies that tracked sources match the Prettier style from
 * `configs/.prettierrc.json` without rewriting files. Exits
 * non-zero when anything is out of format — ideal for CI and the
 * `check` gate. Respects `configs/prettierignore`.
 *
 * HOW TO RUN:
 *   npm run prettier:check
 *   node .devenv/deps/prettier/check.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `prettier:check` — formatting check only (no writes).
 *
 * @module prettier-check
 *
 * @example
 * // Confirm the tree is formatted before opening a PR:
 * //   npm run prettier:check
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [
  "--config",
  "configs/.prettierrc.json",
  "--ignore-path",
  "configs/prettierignore",
  "--check",
  ".",
].concat(forwardedArgs());
process.exitCode = runTool({
  label: "prettier:check",
  bin: "prettier",
  args,
});
