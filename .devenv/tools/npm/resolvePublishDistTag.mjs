#!/usr/bin/env node

/** ==============================================================
 * 🏷️ resolvePublishDistTag
 * ---------------------------------------------------------------
 * Picks the npm dist-tag for `npm publish` given the local version
 * and published registry versions. Empty registry or local greater
 * than max → `latest`. Local less than max → `line-v{major}` so npm
 * does not refuse a lower version for `latest` (bare `v0` / `v1` are
 * rejected as SemVer ranges). `NPM_DIST_TAG` overrides.
 *
 * HOW TO RUN:
 *   npm run npm:resolve-publish-dist-tag
 *   npm run npm:resolve-publish-dist-tag -- 0.1.1
 *   node .devenv/tools/npm/resolvePublishDistTag.mjs 0.1.1
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Dist-tag resolution for registry-aware npm publish.
 *
 * @module npm-resolve-publish-dist-tag
 *
 * @example
 * import { resolvePublishDistTag } from "./resolvePublishDistTag.mjs";
 * resolvePublishDistTag("0.1.1", ["1.0.0"]); // "line-v0"
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
} from "../../lib/tool-lib.mjs";
import { listPublishedVersions } from "./listPublishedVersions.mjs";
import { compareSemver, maxSemver, parseSemverCore } from "./maxSemver.mjs";

/**
 * Resolves which dist-tag to pass to `npm publish`.
 *
 * @param {string} localVersion - Version in package.json.
 * @param {string[]} publishedVersions - Versions already on the registry.
 * @param {{ envTag?: string | null }} [options] - Optional `NPM_DIST_TAG` override.
 * @returns {{ tag: string, reason: string }} Dist-tag and why it was chosen.
 *
 * @example
 * resolvePublishDistTag("1.0.1", ["1.0.0"]); // { tag: "latest", … }
 * resolvePublishDistTag("0.1.1", ["1.0.0"]); // { tag: "line-v0", … }
 */
export function resolvePublishDistTag(localVersion, publishedVersions, options = {}) {
  const override = options.envTag ?? process.env.NPM_DIST_TAG;
  if (override && String(override).trim()) {
    const tag = String(override).trim();
    return { tag, reason: `NPM_DIST_TAG override (${tag})` };
  }

  const local = String(localVersion ?? "").trim();
  const published = Array.isArray(publishedVersions) ? publishedVersions.map(String) : [];
  const max = maxSemver(published);

  if (!max) {
    return { tag: "latest", reason: "no published versions on the registry" };
  }

  if (compareSemver(local, max) > 0) {
    return { tag: "latest", reason: `local ${local} is greater than registry max ${max}` };
  }

  if (compareSemver(local, max) === 0) {
    return {
      tag: "latest",
      reason: `local ${local} matches registry max (publish-if-missing path)`,
    };
  }

  const core = parseSemverCore(local);
  const major = core ? core[0] : 0;
  // npm rejects tags that are valid SemVer ranges (e.g. "v0", "v1").
  const tag = `line-v${major}`;
  return {
    tag,
    reason: `local ${local} is below registry max ${max}; use line tag ${tag} (not latest)`,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ npm resolve-publish-dist-tag");
  try {
    const identity = readPackageIdentity();
    const localVersion = forwardedArgs()[0] || identity.version;
    const published = listPublishedVersions(identity.name);
    const resolved = resolvePublishDistTag(localVersion, published);
    logInfo(`package: ${identity.name}`);
    logInfo(`local: ${localVersion}`);
    logInfo(`registry max: ${maxSemver(published) || "(none)"}`);
    logInfo(`dist-tag: ${resolved.tag}`);
    logInfo(`reason: ${resolved.reason}`);
    logOk(`Resolved dist-tag ${resolved.tag}.`);
    boxDone("npm resolve-publish-dist-tag");
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
