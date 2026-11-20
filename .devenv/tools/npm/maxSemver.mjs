#!/usr/bin/env node

/** ==============================================================
 * 🔢 maxSemver
 * ---------------------------------------------------------------
 * Returns the highest semver (major.minor.patch[+prerelease ignored
 * for ordering of numeric core]) from a list of version strings.
 * Empty input returns null. Used with listPublishedVersions for
 * dist-tag resolution and version-floor gates.
 *
 * HOW TO RUN:
 *   npm run npm:max-semver -- 1.0.0 0.1.1 1.0.1
 *   node .devenv/tools/npm/maxSemver.mjs 1.0.0 0.1.1
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Max-semver helper for npm publish / version-floor tooling.
 *
 * @module npm-max-semver
 *
 * @example
 * import { maxSemver, compareSemver } from "./maxSemver.mjs";
 * maxSemver(["1.0.0", "0.1.1"]); // "1.0.0"
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
} from "../../lib/tool-lib.mjs";

/**
 * Parses a semver-ish string into numeric [major, minor, patch].
 *
 * @param {string} version - Version string.
 * @returns {[number, number, number] | null} Triple, or null if invalid.
 */
export function parseSemverCore(version) {
  const match = String(version ?? "")
    .trim()
    .replace(/^v/i, "")
    .match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * Compares two semver cores: negative if a < b, 0 if equal, positive if a > b.
 *
 * @param {string} a - Left version.
 * @param {string} b - Right version.
 * @returns {number} Comparison result (invalid sorts below valid).
 *
 * @example
 * compareSemver("0.1.1", "1.0.0"); // negative
 */
export function compareSemver(a, b) {
  const left = parseSemverCore(a);
  const right = parseSemverCore(b);
  if (!left && !right) {
    return 0;
  }
  if (!left) {
    return -1;
  }
  if (!right) {
    return 1;
  }
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) {
      return left[i] - right[i];
    }
  }
  return 0;
}

/**
 * Returns the highest version from a list, or null when empty/all invalid.
 *
 * @param {string[]} versions - Candidate versions.
 * @returns {string | null} Max version string.
 *
 * @example
 * maxSemver(["0.1.1", "1.0.0"]); // "1.0.0"
 */
export function maxSemver(versions) {
  const list = Array.isArray(versions) ? versions.map(String) : [];
  /** @type {string | null} */
  let best = null;
  for (const version of list) {
    if (!parseSemverCore(version)) {
      continue;
    }
    if (best === null || compareSemver(version, best) > 0) {
      best = version;
    }
  }
  return best;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔢 npm max-semver");
  const args = forwardedArgs();
  if (args.length === 0) {
    logError("Pass one or more version strings.");
    process.exit(1);
  }
  const max = maxSemver(args);
  if (!max) {
    logError("No valid semver versions in the argument list.");
    process.exit(1);
  }
  logInfo(`max: ${max}`);
  logOk("Resolved max semver.");
  boxDone("npm max-semver");
}
