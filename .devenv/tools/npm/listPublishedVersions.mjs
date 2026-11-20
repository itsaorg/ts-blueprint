#!/usr/bin/env node

/** ==============================================================
 * 📦 listPublishedVersions
 * ---------------------------------------------------------------
 * Lists every version string visible for a package on the public
 * npm registry via `npm view <name> versions --json`. Missing
 * packages (404) return `[]`. Used by publish dist-tag resolution
 * and release/hotfix version-floor gates.
 *
 * HOW TO RUN:
 *   npm run npm:list-published-versions
 *   npm run npm:list-published-versions -- @itsaorg/ts-blueprint
 *   node .devenv/tools/npm/listPublishedVersions.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Registry version listing for npm publish / version-floor helpers.
 *
 * @module npm-list-published-versions
 *
 * @example
 * import { listPublishedVersions } from "./listPublishedVersions.mjs";
 * listPublishedVersions("@itsaorg/ts-blueprint");
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
} from "../../lib/tool-lib.mjs";

/**
 * Lists published versions for a package name on the registry.
 *
 * @param {string} name - Package name (e.g. `@scope/pkg`).
 * @returns {string[]} Version strings (may be empty).
 *
 * @example
 * listPublishedVersions("@itsaorg/ts-blueprint"); // ["1.0.0"]
 */
export function listPublishedVersions(name) {
  const pkg = String(name ?? "").trim();
  if (!pkg) {
    return [];
  }
  try {
    const raw = run(`npm view ${JSON.stringify(pkg)} versions --json`, {
      inherit: false,
    });
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
    if (typeof parsed === "string") {
      return [parsed];
    }
    return [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/E404|404|Not found|no such package/i.test(message)) {
      return [];
    }
    throw new Error(`npm view ${pkg} versions failed: ${message}`, {
      cause: error,
    });
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📦 npm list-published-versions");
  const argName = forwardedArgs()[0];
  const name = argName || readPackageIdentity().name;
  try {
    const versions = listPublishedVersions(name);
    logInfo(`${name}: ${versions.length} version(s)`);
    for (const version of versions) {
      logInfo(version);
    }
    logOk(`Listed ${versions.length} published version(s).`);
    boxDone("npm list-published-versions");
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
