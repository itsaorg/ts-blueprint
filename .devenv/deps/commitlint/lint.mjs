#!/usr/bin/env node

/** ==============================================================
 * ✉️ Commitlint
 * ---------------------------------------------------------------
 * Checks a commit message.
 *
 * HOW TO RUN:
 *   npm run commitlint
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `commitlint` — Checks a commit message.
 *
 * @module commitlint
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--config", "configs/commitlint.config.js"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "commitlint",
  bin: "commitlint",
  args,
});
