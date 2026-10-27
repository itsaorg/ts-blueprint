#!/usr/bin/env node

/** ==============================================================
 * 🎨 Prettier write
 * ---------------------------------------------------------------
 * Rewrites formatting.
 *
 * HOW TO RUN:
 *   npm run prettier:write
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `prettier:write` — Rewrites formatting.
 *
 * @module prettier-write
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
