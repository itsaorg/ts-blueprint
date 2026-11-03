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
 *
 * @example
 * import { statusChangeset } from "./status.mjs";
 * process.exitCode = statusChangeset([]);
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

/**
 * Runs `changeset status --verbose` plus any forwarded args.
 *
 * @param {string[]} [args] - Extra CLI args after `status --verbose`.
 * @returns {number} Process exit code (`0` = success).
 *
 * @example
 * statusChangeset([]);
 */
export function statusChangeset(args = []) {
  const cliArgs = ["status", "--verbose"].concat(args);
  return runTool({
    label: "changeset:status",
    bin: "changeset",
    args: cliArgs,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📋 changeset status");
  const code = statusChangeset(forwardedArgs());
  if (code === 0) {
    boxDone("changeset status");
  }
  process.exitCode = code;
}
