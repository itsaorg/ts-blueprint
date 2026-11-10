#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Tag package.json version
 * ---------------------------------------------------------------
 * On `main`, reads `package.json` version and creates an annotated
 * git tag `v<version>` when it does not already exist. Pass
 * `--push` to push the tag to `origin` (triggers `release.yml`).
 * Refuses detached HEAD and non-`main` branches unless
 * `--allow-any-branch` is set.
 *
 * HOW TO RUN:
 *   npm run git:tag:version
 *   npm run git:tag:version -- --push
 *   node .devenv/tools/git/tag-version.mjs --push
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Creates (and optionally pushes) `v<version>` from package.json.
 *
 * @module git-tag-version
 *
 * @example
 * // On main after a release merge:
 * //   npm run git:tag:version -- --push
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logGo,
  logInfo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";

/**
 * Current git branch name, or empty string.
 *
 * @returns {string} Branch name.
 *
 * @example
 * currentBranchName(); // "main"
 */
export function currentBranchName() {
  try {
    return run("git branch --show-current", { inherit: false });
  } catch {
    return "";
  }
}

/**
 * Reads the root `package.json` version field.
 *
 * @returns {string} Semver string, or empty on failure.
 *
 * @example
 * readPackageVersion(); // "0.1.0"
 */
export function readPackageVersion() {
  try {
    const raw = readFileSync(path.join(repoRoot, "package.json"), "utf8");
    const parsed = JSON.parse(raw);
    return String(parsed.version ?? "");
  } catch {
    return "";
  }
}

/**
 * Whether a local git tag already exists.
 *
 * @param {string} tag - Full tag name (e.g. `v0.1.0`).
 * @returns {boolean} True when the tag ref exists locally.
 *
 * @example
 * tagExistsLocally("v0.1.0");
 */
export function tagExistsLocally(tag) {
  try {
    const out = run(`git tag --list ${JSON.stringify(tag)}`, { inherit: false });
    return out.split(/\r?\n/).filter(Boolean).includes(tag);
  } catch {
    return false;
  }
}

/**
 * Creates an annotated `v<version>` tag on `main` (optional push).
 *
 * @param {{ push?: boolean, allowAnyBranch?: boolean, message?: string }} [options] - Options.
 * @returns {{ ok: boolean, tag?: string, skipped?: boolean }} Outcome.
 *
 * @example
 * tagPackageVersion({ push: true });
 * tagPackageVersion({ allowAnyBranch: true });
 */
export function tagPackageVersion(options = {}) {
  const branch = currentBranchName();
  if (!branch) {
    logError("Could not determine current branch (detached HEAD?).");
    logInfo("Check out main first.");
    return { ok: false };
  }
  if (branch !== "main" && !options.allowAnyBranch) {
    logError(`git:tag:version refused on branch "${branch}".`);
    logInfo("Check out main after the release/hotfix merge, or pass --allow-any-branch.");
    return { ok: false };
  }

  const version = readPackageVersion();
  if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
    logError(`Invalid or missing package.json version: "${version}".`);
    return { ok: false };
  }

  const tag = `v${version}`;
  if (tagExistsLocally(tag)) {
    logSkip(`Tag ${tag} already exists locally.`);
    if (options.push) {
      logGo(`git push origin ${tag}`);
      try {
        run(`git push origin ${JSON.stringify(tag)}`);
        logOk(`Pushed existing tag ${tag}`);
      } catch {
        logError(`Failed to push tag ${tag}`);
        return { ok: false, tag, skipped: true };
      }
    }
    return { ok: true, tag, skipped: true };
  }

  const message = options.message || `Release ${tag}`;
  logGo(`git tag -a ${tag} -m …`);
  try {
    run(`git tag -a ${JSON.stringify(tag)} -m ${JSON.stringify(message)}`);
    logOk(`Created annotated tag ${tag}`);
  } catch {
    logError(`Failed to create tag ${tag}`);
    return { ok: false };
  }

  if (options.push) {
    logGo(`git push origin ${tag}`);
    try {
      run(`git push origin ${JSON.stringify(tag)}`);
      logOk(`Pushed tag ${tag} (release.yml should run)`);
    } catch {
      logError(`Failed to push tag ${tag}`);
      return { ok: false, tag };
    }
  } else {
    logInfo(`Tag created locally. Push with: npm run git:tag:version -- --push`);
  }

  return { ok: true, tag, skipped: false };
}

/**
 * Parses CLI flags for the tag helper.
 *
 * @param {string[]} args - Forwarded argv.
 * @returns {{ push: boolean, allowAnyBranch: boolean }} Flags.
 *
 * @example
 * parseTagArgs(["--push", "--allow-any-branch"]);
 */
export function parseTagArgs(args) {
  return {
    push: args.includes("--push"),
    allowAnyBranch: args.includes("--allow-any-branch"),
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ git tag version");
  const flags = parseTagArgs(forwardedArgs());
  const result = tagPackageVersion(flags);
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git tag version");
}
