#!/usr/bin/env node

/** ==============================================================
 * ✍️ Prettier write
 * ---------------------------------------------------------------
 * Rewrites files in place to match `configs/.prettierrc.json`.
 * Uses `configs/prettierignore` so generated and vendor paths stay
 * untouched. Run locally when `prettier:check` reports drift.
 *
 * HOW TO RUN:
 *   npm run prettier:write
 *   node .devenv/deps/prettier/write.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `prettier:write` — formats the repository in place.
 *
 * @module prettier-write
 *
 * @example
 * // Apply Prettier across the tree:
 * //   npm run prettier:write
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [
  "--config",
  "configs/.prettierrc.json",
  "--ignore-path",
  "configs/prettierignore",
  "--write",
  ".",
].concat(forwardedArgs());
process.exitCode = runTool({
  label: "prettier:write",
  bin: "prettier",
  args,
});
