#!/usr/bin/env node

/** ==============================================================
 * 📦 Release branch publish
 * ---------------------------------------------------------------
 * Pending-changeset gate (or version already applied) →
 * `git flow release publish` → ensure a PR into `main`.
 * Bypass with `--allow-no-changeset` or TTY confirm when needed.
 *
 * HOW TO RUN:
 *   npm run git:flow:release:publish
 *   node .devenv/tools/git-flow/release/publish.mjs --allow-no-changeset
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Publishes a Git Flow release branch and opens/ensures a PR.
 *
 * @module git-flow-release-publish
 *
 * @example
 * // On release/1.2.0 after changeset:version:
 * //   npm run git:flow:release:publish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { parseBaseArgs, publishWithPullRequest } from "../publish-flow.mjs";

/**
 * Publishes the current release branch (pending gate + push + PR).
 *
 * @param {{ base?: string, nameArgs?: string[], allowNoChangeset?: boolean }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await publishRelease();
 */
export async function publishRelease(options = {}) {
  return publishWithPullRequest("release", {
    base: options.base || "main",
    nameArgs: options.nameArgs,
    allowNoChangeset: options.allowNoChangeset,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📦 release publish");
  const args = forwardedArgs();
  const { base, allowNoChangeset, rest } = parseBaseArgs(args);
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await publishRelease({
    base,
    allowNoChangeset,
    nameArgs: rest.length > 0 ? rest : undefined,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("release publish");
}
