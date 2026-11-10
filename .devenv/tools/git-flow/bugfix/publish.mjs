#!/usr/bin/env node

/** ==============================================================
 * 🐛 Bugfix branch publish
 * ---------------------------------------------------------------
 * Pending-changeset gate → `git flow bugfix publish` → ensure a
 * pull request into `develop`. Bypass with `--allow-no-changeset`
 * or interactive TTY confirm when there is no package bump.
 *
 * HOW TO RUN:
 *   npm run git:flow:bugfix:publish
 *   node .devenv/tools/git-flow/bugfix/publish.mjs --allow-no-changeset
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Publishes a Git Flow bugfix branch and opens/ensures a PR.
 *
 * @module git-flow-bugfix-publish
 *
 * @example
 * //   npm run git:flow:bugfix:publish
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, forwardedArgs, logError } from "../../../lib/tool-lib.mjs";
import { parseBaseArgs, publishWithPullRequest } from "../publish-flow.mjs";

/**
 * Publishes the current bugfix branch (pending gate + push + PR).
 *
 * @param {{ base?: string, nameArgs?: string[], allowNoChangeset?: boolean, bodyFile?: string }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await publishBugfix();
 */
export async function publishBugfix(options = {}) {
  return publishWithPullRequest("bugfix", {
    base: options.base || "develop",
    nameArgs: options.nameArgs,
    allowNoChangeset: options.allowNoChangeset,
    bodyFile: options.bodyFile,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🐛 bugfix publish");
  const args = forwardedArgs();
  const { base, allowNoChangeset, bodyFile, rest } = parseBaseArgs(args);
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (args.includes("--body-file") && !bodyFile) {
    logError("Pass --body-file <path>.");
    process.exit(1);
  }
  const result = await publishBugfix({
    base,
    allowNoChangeset,
    bodyFile,
    nameArgs: rest.length > 0 ? rest : undefined,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("bugfix publish");
}
