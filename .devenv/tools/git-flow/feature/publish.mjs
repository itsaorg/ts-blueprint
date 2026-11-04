#!/usr/bin/env node

/** ==============================================================
 * 🌟 Feature branch publish
 * ---------------------------------------------------------------
 * Pending-changeset gate → `git flow feature publish` → ensure a
 * pull request into `develop` (override with `--base`). Seeds
 * `Closes #N` when the branch is `feature/<number>-<slug>`.
 * Chore/docs without a bump: `--allow-no-changeset` or TTY confirm.
 *
 * HOW TO RUN:
 *   npm run git:flow:feature:publish
 *   node .devenv/tools/git-flow/feature/publish.mjs
 *   node .devenv/tools/git-flow/feature/publish.mjs --allow-no-changeset
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Publishes a Git Flow feature branch and opens/ensures a PR.
 *
 * @module git-flow-feature-publish
 *
 * @example
 * // On feature/42-add-login (after npm run changeset:add):
 * //   npm run git:flow:feature:publish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { parseBaseArgs, publishWithPullRequest } from "../publish-flow.mjs";

/**
 * Publishes the current feature branch (pending gate + push + PR).
 *
 * @param {{ base?: string, nameArgs?: string[], allowNoChangeset?: boolean }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await publishFeature();
 * await publishFeature({ allowNoChangeset: true });
 */
export async function publishFeature(options = {}) {
  return publishWithPullRequest("feature", {
    base: options.base || "develop",
    nameArgs: options.nameArgs,
    allowNoChangeset: options.allowNoChangeset,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌟 feature publish");
  const args = forwardedArgs();
  const { base, allowNoChangeset, rest } = parseBaseArgs(args);
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await publishFeature({
    base,
    allowNoChangeset,
    nameArgs: rest.length > 0 ? rest : undefined,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("feature publish");
}
