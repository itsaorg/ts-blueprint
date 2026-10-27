#!/usr/bin/env node

/** ==============================================================
 * 📝 Changeset version
 * ---------------------------------------------------------------
 * Applies Changesets to the version.
 *
 * HOW TO RUN:
 *   npm run changeset:version
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `changeset:version` — Applies Changesets to the version.
 *
 * @module changeset-version
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["version"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "changeset:version",
  bin: "changeset",
  args,
});
