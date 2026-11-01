#!/usr/bin/env node

/** ==============================================================
 * 🌿 Git Flow init
 * ---------------------------------------------------------------
 * Initializes Git Flow AVH with explicit main/develop branches,
 * branch prefixes, and version tag prefix `v`. Idempotent: skips
 * when config already matches; repairs drift with force init.
 *
 * HOW TO RUN:
 *   node .devenv/tools/git-flow/init.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Initializes Git Flow for this repository.
 *
 * @module git-flow-init
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";
import { isGitFlowInstalled } from "./isInstalled.mjs";

/** @type {Readonly<Record<string, string>>} Expected local gitflow.* keys. */
const EXPECTED = Object.freeze({
  "gitflow.branch.master": "main",
  "gitflow.branch.develop": "develop",
  "gitflow.prefix.feature": "feature/",
  "gitflow.prefix.bugfix": "bugfix/",
  "gitflow.prefix.release": "release/",
  "gitflow.prefix.hotfix": "hotfix/",
  "gitflow.prefix.support": "support/",
  "gitflow.prefix.versiontag": "v",
});

/**
 * Reads a local git config value, or empty string.
 *
 * @param {string} key - Config key.
 * @returns {string} Value or "".
 */
function getLocal(key) {
  try {
    return run(`git config --local --get ${key}`, { inherit: false });
  } catch {
    return "";
  }
}

/**
 * Lists expected keys whose current value differs.
 *
 * @returns {{ key: string, expected: string, actual: string }[]} Drift entries.
 */
function findDrift() {
  /** @type {{ key: string, expected: string, actual: string }[]} */
  const drift = [];
  for (const [key, expected] of Object.entries(EXPECTED)) {
    const actual = getLocal(key);
    if (actual !== expected) {
      drift.push({ key, expected, actual });
    }
  }
  return drift;
}

/**
 * Runs explicit `git flow init` with all naming flags.
 *
 * @returns {boolean} True when the command exits 0.
 */
function runExplicitInit() {
  for (const [key, value] of Object.entries(EXPECTED)) {
    if (key.startsWith("gitflow.branch.")) {
      run(`git config --local ${key} ${value}`);
    }
  }

  const args = [
    "flow",
    "init",
    "-d",
    "-f",
    "-p",
    EXPECTED["gitflow.prefix.feature"],
    "-b",
    EXPECTED["gitflow.prefix.bugfix"],
    "-r",
    EXPECTED["gitflow.prefix.release"],
    "-x",
    EXPECTED["gitflow.prefix.hotfix"],
    "-s",
    EXPECTED["gitflow.prefix.support"],
    "-t",
    EXPECTED["gitflow.prefix.versiontag"],
  ];
  logGo(`git ${args.join(" ")}`);
  const result = spawnSync("git", args, { cwd: repoRoot, stdio: "inherit" });
  return (result.status ?? 1) === 0;
}

/**
 * Ensures git-flow config matches this repository's conventions.
 *
 * @returns {{ ok: boolean, initialized: boolean, skipped?: boolean }} Outcome.
 */
export function initGitFlow() {
  const installed = isGitFlowInstalled();
  if (!installed.ok) {
    logSkip("git-flow missing. Skipping init.");
    return { ok: false, initialized: false };
  }

  const drift = findDrift();
  if (drift.length === 0) {
    logSkip(
      `git-flow config matches (master=${EXPECTED["gitflow.branch.master"]}, develop=${EXPECTED["gitflow.branch.develop"]}, tag=${EXPECTED["gitflow.prefix.versiontag"]})`,
    );
    return { ok: true, initialized: true, skipped: true };
  }

  for (const entry of drift) {
    logGo(`Repair ${entry.key}: "${entry.actual || "(unset)"}" → "${entry.expected}"`);
  }

  try {
    if (!runExplicitInit()) {
      logError("git flow init failed");
      return { ok: false, initialized: false };
    }
    const remaining = findDrift();
    if (remaining.length > 0) {
      for (const entry of remaining) {
        logError(`${entry.key} still "${entry.actual || "(unset)"}" (want "${entry.expected}")`);
      }
      return { ok: false, initialized: false };
    }
    logOk(
      `git-flow initialized (master=${EXPECTED["gitflow.branch.master"]}, develop=${EXPECTED["gitflow.branch.develop"]}, tag=${EXPECTED["gitflow.prefix.versiontag"]})`,
    );
    return { ok: true, initialized: true, skipped: false };
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    return { ok: false, initialized: false };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🌿 git-flow init");
  const result = initGitFlow();
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git-flow init");
}
