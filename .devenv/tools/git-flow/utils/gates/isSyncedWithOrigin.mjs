#!/usr/bin/env node

/** ==============================================================
 * 🚪 isSyncedWithOrigin
 * ---------------------------------------------------------------
 * Whether `base` and `origin/base` have zero ahead/behind.
 * Does not fetch; callers that need freshness should fetch first.
 *
 * HOW TO RUN:
 *   imported by git-flow utils
 *   node .devenv/tools/git-flow/utils/gates/isSyncedWithOrigin.mjs develop
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Origin sync gate for a base branch.
 *
 * @module git-flow-gate-is-synced-with-origin
 *
 * @example
 * import { isSyncedWithOrigin } from "./isSyncedWithOrigin.mjs";
 * isSyncedWithOrigin("develop");
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logInfo, run } from "../../../../lib/tool-lib.mjs";
import { parseAheadBehind } from "./parseAheadBehind.mjs";

/**
 * Whether `base` and `origin/base` have zero ahead/behind.
 *
 * @param {string} base - Local branch name (e.g. `develop`).
 * @returns {boolean} True when fully synced.
 *
 * @example
 * isSyncedWithOrigin("develop");
 */
export function isSyncedWithOrigin(base) {
  try {
    run(`git rev-parse --verify origin/${base}`, { inherit: false });
  } catch {
    return false;
  }
  try {
    const raw = run(`git rev-list --left-right --count ${base}...origin/${base}`, {
      inherit: false,
    });
    const counts = parseAheadBehind(raw);
    return Boolean(counts) && counts.ahead === 0 && counts.behind === 0;
  } catch {
    return false;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚪 isSyncedWithOrigin");
  const [base] = forwardedArgs();
  logInfo(String(isSyncedWithOrigin(base || "")));
  boxDone("isSyncedWithOrigin");
}
