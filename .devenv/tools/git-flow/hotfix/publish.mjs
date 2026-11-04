#!/usr/bin/env node

/** ==============================================================
 * 🚑 Hotfix branch publish
 * ---------------------------------------------------------------
 * Pending-changeset gate (or version already applied) →
 * `git flow hotfix publish` → ensure a PR into `main`.
 * Bypass with `--allow-no-changeset` or TTY confirm when needed.
 *
 * HOW TO RUN:
 *   npm run git:flow:hotfix:publish
 *   node .devenv/tools/git-flow/hotfix/publish.mjs --allow-no-changeset
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Publishes a Git Flow hotfix branch and opens/ensures a PR.
 *
 * @module git-flow-hotfix-publish
 *
 * @example
 * //   npm run git:flow:hotfix:publish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { parseBaseArgs, publishWithPullRequest } from "../publish-flow.mjs";

/**
 * Publishes the current hotfix branch (pending gate + push + PR).
 *
 * @param {{ base?: string, nameArgs?: string[], allowNoChangeset?: boolean }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await publishHotfix();
 */
export async function publishHotfix(options = {}) {
  return publishWithPullRequest("hotfix", {
    base: options.base || "main",
    nameArgs: options.nameArgs,
    allowNoChangeset: options.allowNoChangeset,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚑 hotfix publish");
  const args = forwardedArgs();
  const { base, allowNoChangeset, rest } = parseBaseArgs(args);
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await publishHotfix({
    base,
    allowNoChangeset,
    nameArgs: rest.length > 0 ? rest : undefined,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("hotfix publish");
}
