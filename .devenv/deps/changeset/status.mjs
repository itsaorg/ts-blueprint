#!/usr/bin/env node

/** ==============================================================
 * 📋 Changeset status
 * ---------------------------------------------------------------
 * Prints pending Changesets in verbose form so you can see which
 * packages would bump and why. Run before `changeset:version` on a
 * `release/*` or `hotfix/*` branch (version refuses develop/main).
 * Extra flags forward after `--`.
 *
 * HOW TO RUN:
 *   npm run changeset:status
 *   node .devenv/deps/changeset/status.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `changeset:status` — lists pending Changesets.
 *
 * @module changeset-status
 *
 * @example
 * // Inspect what would ship in the next version bump:
 * //   npm run changeset:status
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["status", "--verbose"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "changeset:status",
  bin: "changeset",
  args,
});
