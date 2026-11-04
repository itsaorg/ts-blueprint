#!/usr/bin/env node

/** ==============================================================
 * 📦 Release post-merge finish
 * ---------------------------------------------------------------
 * After the release PR into `main` is merged: version gates +
 * review/merge gates, then delete the branch. Solo maintainers:
 * `--allow-unapproved` or TTY confirm. Then tag with
 * `npm run git:tag:version`.
 *
 * HOW TO RUN:
 *   npm run git:flow:release:finish
 *   node .devenv/tools/git-flow/release/finish.mjs --allow-unapproved
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Post-merge finish for a Git Flow release branch.
 *
 * @module git-flow-release-finish
 *
 * @example
 * //   npm run git:flow:release:finish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError, logInfo } from "../../../lib/tool-lib.mjs";
import { finishAfterMerge, parseBaseArgs } from "../finish-merged.mjs";

/**
 * Verifies remote merge gates and cleans up the release branch.
 *
 * @param {{ base?: string, allowUnapproved?: boolean }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await finishRelease();
 */
export async function finishRelease(options = {}) {
  return finishAfterMerge("release", {
    base: options.base || "main",
    allowUnapproved: options.allowUnapproved,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📦 release finish");
  const args = forwardedArgs();
  const { base, allowUnapproved } = parseBaseArgs(args);
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await finishRelease({
    ...(base ? { base } : {}),
    allowUnapproved,
  });
  if (!result.ok) {
    process.exit(1);
  }
  logInfo("On main: npm run git:tag:version -- --push so release.yml can publish.");
  boxDone("release finish");
}
