#!/usr/bin/env node

/** ==============================================================
 * 📝 Changeset status
 * ---------------------------------------------------------------
 * Shows pending Changesets.
 *
 * HOW TO RUN:
 *   npm run changeset:status
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `changeset:status` — Shows pending Changesets.
 *
 * @module changeset-status
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["status", "--verbose"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "changeset:status",
  bin: "changeset",
  args,
});
