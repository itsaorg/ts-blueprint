#!/usr/bin/env node

/** ==============================================================
 * 🚑 Hotfix branch publish
 * ---------------------------------------------------------------
 * Pending-changeset gate → `git flow hotfix publish` → ensure a
 * pull request into `main`. On the hotfix branch, run
 * `changeset:version` before publish when you are ready to cut the
 * patch version. Requires Git Flow AVH and pending `.changeset/*.md`
 * until version consumes them (re-add if you still need notes).
 *
 * HOW TO RUN:
 *   npm run git:flow:hotfix:publish
 *   node .devenv/tools/git-flow/hotfix/publish.mjs
 *   node .devenv/tools/git-flow/hotfix/publish.mjs --base main
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
 * // On hotfix/1.2.1 after changeset:add (and usually changeset:version):
 * //   npm run git:flow:hotfix:publish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { parseBaseArgs, publishWithPullRequest } from "../publish-flow.mjs";

/**
 * Publishes the current hotfix branch (pending gate + push + PR).
 *
 * @param {{ base?: string, nameArgs?: string[] }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await publishHotfix();
 */
export async function publishHotfix(options = {}) {
  return publishWithPullRequest("hotfix", {
    base: options.base || "main",
    nameArgs: options.nameArgs,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚑 hotfix publish");
  const { base, rest } = parseBaseArgs(forwardedArgs());
  if (forwardedArgs().includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await publishHotfix({
    base,
    nameArgs: rest.length > 0 ? rest : undefined,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("hotfix publish");
}
