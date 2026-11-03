#!/usr/bin/env node

/** ==============================================================
 * 🛟 Support branch publish
 * ---------------------------------------------------------------
 * Pending-changeset gate → `git push -u` (Git Flow AVH has **no**
 * `support publish`) → ensure a pull request. Default base is
 * `main` (override with `--base` or an interactive prompt). Use
 * this when syncing or retiring the support line itself. Day-to-day
 * maintenance still opens feature/bugfix PRs **into** `support/<name>`.
 *
 * HOW TO RUN:
 *   npm run git:flow:support:publish
 *   node .devenv/tools/git-flow/support/publish.mjs
 *   node .devenv/tools/git-flow/support/publish.mjs --base main
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
 * // On support/1.x after npm run changeset:add:
 * //   npm run git:flow:support:publish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { parseBaseArgs, publishWithPullRequest } from "../publish-flow.mjs";

/**
 * Publishes the current support branch (pending gate + push + PR).
 *
 * @param {{ base?: string, nameArgs?: string[] }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await publishSupport({ base: "main" });
 */
export async function publishSupport(options = {}) {
  return publishWithPullRequest("support", {
    base: options.base,
    nameArgs: options.nameArgs,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🛟 support publish");
  const { base, rest } = parseBaseArgs(forwardedArgs());
  if (forwardedArgs().includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await publishSupport({
    base,
    nameArgs: rest.length > 0 ? rest : undefined,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("support publish");
}
