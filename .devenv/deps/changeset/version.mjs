#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Changeset version
 * ---------------------------------------------------------------
 * Applies pending Changesets: bumps package versions and updates
 * changelogs. Allowed only on `release/*` or `hotfix/*` branches —
 * never on `develop` or `main`. After versioning, PR into `main`,
 * tag `v<version>`, and let `release.yml` publish.
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
 */

import { forwardedArgs, logError, logInfo, run, runTool } from "../../lib/tool-lib.mjs";

/**
 * Current git branch, or empty string.
 *
 * @returns {string} Branch name.
 */
function currentBranch() {
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
 * @returns {boolean} True for release/* or hotfix/*.
 */
function isVersionBranch(branch) {
  return branch.startsWith("release/") || branch.startsWith("hotfix/");
}

const branch = currentBranch();
if (!isVersionBranch(branch)) {
  logError(`changeset:version refused on branch "${branch || "(detached)"}".`);
  logInfo("Run only on release/<x.y.z> or hotfix/<x.y.z>, then PR into main.");
  logInfo("Do not run on develop or main.");
  process.exitCode = 1;
} else {
  const args = ["version"].concat(forwardedArgs());
  process.exitCode = runTool({
    label: "changeset:version",
    bin: "changeset",
    args,
  });
}
