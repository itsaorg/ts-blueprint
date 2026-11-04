#!/usr/bin/env node

/** ==============================================================
 * 🛟 Support branch publish
 * ---------------------------------------------------------------
 * Pending-changeset gate → `git push -u` (AVH has no support
 * publish) → ensure a PR. Empty new support lines: pass
 * `--allow-no-changeset` or confirm on a TTY.
 *
 * HOW TO RUN:
 *   npm run git:flow:support:publish
 *   node .devenv/tools/git-flow/support/publish.mjs --allow-no-changeset
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Publishes a Git Flow support branch and opens/ensures a PR.
 *
 * @module git-flow-support-publish
 *
 * @example
 * //   npm run git:flow:support:publish -- --allow-no-changeset
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { parseBaseArgs, publishWithPullRequest } from "../publish-flow.mjs";

/**
 * Publishes the current support branch (pending gate + push + PR).
 *
 * @param {{ base?: string, nameArgs?: string[], allowNoChangeset?: boolean }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await publishSupport({ allowNoChangeset: true });
 */
export async function publishSupport(options = {}) {
  return publishWithPullRequest("support", {
    base: options.base,
    nameArgs: options.nameArgs,
    allowNoChangeset: options.allowNoChangeset,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🛟 support publish");
  const args = forwardedArgs();
  const { base, allowNoChangeset, rest } = parseBaseArgs(args);
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await publishSupport({
    base,
    allowNoChangeset,
    nameArgs: rest.length > 0 ? rest : undefined,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("support publish");
}
