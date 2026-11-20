#!/usr/bin/env node

/** ==============================================================
 * 🧱 assertVersionAboveFloor
 * ---------------------------------------------------------------
 * Refuses a proposed release/hotfix version when it is not strictly
 * greater than max(registry published versions, local `v*` git tags).
 * Prevents regressing below a version already on npm (e.g. cutting
 * 0.1.x after 1.0.0 was published).
 *
 * HOW TO RUN:
 *   imported by gf:release:start / gf:hotfix:start
 *   node .devenv/tools/git-flow/utils/assertVersionAboveFloor.mjs 1.0.1
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Version-floor gate for release/hotfix starts.
 *
 * @module git-flow-assert-version-above-floor
 *
 * @example
 * import { assertVersionAboveFloor } from "./assertVersionAboveFloor.mjs";
 * assertVersionAboveFloor("1.0.1");
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logInfo,
  logOk,
  readPackageIdentity,
  run,
} from "../../../lib/tool-lib.mjs";
import { listPublishedVersions } from "../../npm/listPublishedVersions.mjs";
import { compareSemver, maxSemver } from "../../npm/maxSemver.mjs";

/**
 * Lists local annotated/lightweight tags matching `v*`, stripped of `v`.
 *
 * @returns {string[]} Version cores from tags.
 */
export function listLocalVTagVersions() {
  try {
    const raw = run('git tag -l "v*"', { inherit: false });
    return String(raw || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((tag) => tag.replace(/^v/i, ""));
  } catch {
    return [];
  }
}

/**
 * Computes the version floor from registry + local `v*` tags.
 *
 * @param {string} [packageName] - Defaults to package.json name.
 * @returns {{ floor: string | null, registryMax: string | null, tagMax: string | null }} Floor pieces.
 */
export function computeVersionFloor(packageName) {
  const name = packageName || readPackageIdentity().name;
  const registryMax = maxSemver(listPublishedVersions(name));
  const tagMax = maxSemver(listLocalVTagVersions());
  const floor = maxSemver([registryMax, tagMax].filter(Boolean));
  return { floor, registryMax, tagMax };
}

/**
 * Asserts proposed version is strictly greater than the floor.
 *
 * @param {string} proposed - Semver for release/hotfix branch.
 * @param {{ packageName?: string }} [options] - Optional package name override.
 * @returns {{ ok: boolean, floor?: string | null }} Outcome.
 *
 * @example
 * assertVersionAboveFloor("1.0.1");
 */
export function assertVersionAboveFloor(proposed, options = {}) {
  const version = String(proposed ?? "")
    .trim()
    .replace(/^v/i, "");
  if (!version) {
    logError("Pass a semver version (e.g. 1.0.1).");
    return { ok: false };
  }

  const { floor, registryMax, tagMax } = computeVersionFloor(options.packageName);
  logInfo(`Proposed version: ${version}`);
  logInfo(`Registry max: ${registryMax || "(none)"}`);
  logInfo(`Local v* tag max: ${tagMax || "(none)"}`);
  logInfo(`Floor: ${floor || "(none)"}`);

  if (!floor) {
    logOk("No registry/git version floor — proposed version is allowed.");
    return { ok: true, floor: null };
  }

  if (compareSemver(version, floor) > 0) {
    logOk(`Version ${version} is above floor ${floor}.`);
    return { ok: true, floor };
  }

  logError(
    `Version ${version} must be strictly greater than floor ${floor} (max of npm registry + local v* tags).`,
  );
  logInfo(`Next cut must be > ${floor} so npm can publish as latest without a line dist-tag.`);
  return { ok: false, floor };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🧱 assertVersionAboveFloor");
  const proposed = forwardedArgs()[0];
  if (!assertVersionAboveFloor(proposed).ok) {
    process.exit(1);
  }
  boxDone("assertVersionAboveFloor");
}
