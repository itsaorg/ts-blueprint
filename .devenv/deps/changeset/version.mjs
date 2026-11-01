#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Changeset version
 * ---------------------------------------------------------------
 * Applies pending Changesets: bumps package versions and updates
 * changelogs according to the Changesets config. Run this on a
 * release branch after reviewing `changeset:status`. Extra flags
 * forward after `--`.
 *
 * HOW TO RUN:
 *   npm run changeset:version
 *   node .devenv/deps/changeset/version.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `changeset:version` — apply Changesets version bumps.
 *
 * @module changeset-version
 *
 * @example
 * // Consume pending changesets into version + changelog updates:
 * //   npm run changeset:version
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["version"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "changeset:version",
  bin: "changeset",
  args,
});
