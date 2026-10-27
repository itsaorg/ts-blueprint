#!/usr/bin/env node

/** ==============================================================
 * 🎨 Prettier check
 * ---------------------------------------------------------------
 * Checks formatting.
 *
 * HOW TO RUN:
 *   npm run prettier:check
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `prettier:check` — Checks formatting.
 *
 * @module prettier-check
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
