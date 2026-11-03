#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Changeset version
 * ---------------------------------------------------------------
 * Applies pending Changesets: bumps package versions and updates
 * changelogs. Allowed only on `release/*` or `hotfix/*` branches —
 * never on `develop` or `main`. After versioning, publish a PR into
 * `main`, tag `v<version>`, and let `release.yml` publish.
 *
 * HOW TO RUN:
 *   npm run changeset:version
 *   node .devenv/deps/changeset/version.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `changeset:version` — apply Changesets version bumps.
 *
 * @module changeset-version
 *
 * @example
 * // On release/1.2.0 only:
 * //   npm run changeset:version
 *
 * @example
 * import { versionChangeset, isVersionBranch } from "./version.mjs";
 * if (isVersionBranch("hotfix/1.2.1")) {
 *   versionChangeset([]);
 * }
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logInfo,
  run,
  runTool,
} from "../../lib/tool-lib.mjs";

/**
 * Current git branch, or empty string.
 *
 * @returns {string} Branch name.
 *
 * @example
 * currentBranchName(); // "release/1.2.0"
 */
export function currentBranchName() {
  try {
    return run("git branch --show-current", { inherit: false });
  } catch {
    return "";
  }
}

/**
 * Whether version bumps are allowed on this branch.
 *
 * @param {string} branch - Current branch name.
 * @returns {boolean} True for `release/*` or `hotfix/*`.
 *
 * @example
 * isVersionBranch("release/1.0.0"); // true
 * isVersionBranch("develop");       // false
 */
export function isVersionBranch(branch) {
  return branch.startsWith("release/") || branch.startsWith("hotfix/");
}

/**
 * Runs `changeset version` when the branch gate passes.
 *
 * @param {string[]} [args] - Extra args for `changeset version`.
 * @returns {number} Process exit code (`0` = success).
 *
 * @example
 * process.exitCode = versionChangeset([]);
 */
export function versionChangeset(args = []) {
  const branch = currentBranchName();
  if (!isVersionBranch(branch)) {
    logError(`changeset:version refused on branch "${branch || "(detached)"}".`);
    logInfo("Run only on release/<x.y.z> or hotfix/<x.y.z>, then PR into main.");
    logInfo("Do not run on develop or main.");
    return 1;
  }

  const cliArgs = ["version"].concat(args);
  return runTool({
    label: "changeset:version",
    bin: "changeset",
    args: cliArgs,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ changeset version");
  const code = versionChangeset(forwardedArgs());
  if (code === 0) {
    boxDone("changeset version");
  }
  process.exitCode = code;
}
