#!/usr/bin/env node

/** ==============================================================
 * 📦 npm pack smoke
 * ---------------------------------------------------------------
 * Builds `dist/` when needed, runs `npm pack --dry-run`, and
 * asserts the would-be tarball includes `package/dist/` entry
 * paths while excluding typical secrets (`.env`, `node_modules`).
 * Used locally and from CI after `npm run check`.
 *
 * HOW TO RUN:
 *   npm run npm:pack:smoke
 *   node .devenv/tools/npm/pack/smoke.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `npm:pack:smoke` — dry-run pack + content assertions.
 *
 * @module npm-pack-smoke
 *
 * @example
 * // After a successful build:
 * //   npm run npm:pack:smoke
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  logInfo,
  logOk,
  repoRoot,
  runNpmScript,
} from "../../../lib/tool-lib.mjs";

/**
 * Ensures `dist/index.js` exists (runs `tsc:build` when missing).
 *
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * ensureDistBuilt();
 */
export function ensureDistBuilt() {
  const entry = path.join(repoRoot, "dist", "index.js");
  if (existsSync(entry)) {
    logOk("dist/index.js already present");
    return { ok: true };
  }
  logGo("dist missing — running tsc:build");
  const code = runNpmScript("tsc:build");
  if (code !== 0) {
    logError("tsc:build failed before pack smoke");
    return { ok: false };
  }
  return { ok: true };
}

/**
 * Runs `npm pack --dry-run --json --ignore-scripts` and returns file paths.
 *
 * `--ignore-scripts` avoids `prepare` flooding stdout so JSON stays parseable.
 *
 * @returns {string[]} Paths as listed under each pack entry's `files`.
 *
 * @example
 * const paths = listPackDryRunPaths();
 */
export function listPackDryRunPaths() {
  // shell:true so Windows resolves npm.cmd; --ignore-scripts keeps prepare quiet.
  const result = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if ((result.status ?? 1) !== 0) {
    throw new Error(result.stderr?.trim() || "npm pack --dry-run failed");
  }
  const raw = String(result.stdout || "").trim();
  // npm may print warnings on stdout before JSON; locate the root object/array.
  const objStart = raw.indexOf("{");
  const arrStart = raw.indexOf("[");
  const candidates = [objStart, arrStart].filter((index) => index >= 0);
  if (candidates.length === 0) {
    throw new Error("npm pack --json produced no JSON");
  }
  const parsed = JSON.parse(raw.slice(Math.min(...candidates)));
  /** @type {string[]} */
  const paths = [];
  /** @type {unknown[]} */
  const entries = Array.isArray(parsed) ? parsed : Object.values(parsed);
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const files = /** @type {{ files?: unknown }} */ (entry).files;
    if (!Array.isArray(files)) {
      continue;
    }
    for (const file of files) {
      if (typeof file === "string") {
        paths.push(file);
      } else if (file && typeof file === "object" && "path" in file) {
        paths.push(String(/** @type {{ path: string }} */ (file).path));
      }
    }
  }
  return paths;
}

/**
 * Asserts pack dry-run output looks like a publishable library tarball.
 *
 * @param {string[]} paths - Paths from `listPackDryRunPaths`.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * assertPackSmokePaths(["package/dist/index.js", "package/package.json"]);
 */
export function assertPackSmokePaths(paths) {
  const hasDist = paths.some(
    (p) =>
      p === "dist/index.js" ||
      p.startsWith("dist/") ||
      p.includes("package/dist/") ||
      p.endsWith("/dist/index.js"),
  );
  const hasPackageJson = paths.some(
    (p) =>
      p === "package.json" || p.endsWith("/package.json") || p.includes("package/package.json"),
  );
  const hasSecret = paths.some(
    (p) =>
      p === ".env" ||
      p.startsWith(".env.") ||
      p.includes("/.env") ||
      p.includes("node_modules/") ||
      p.startsWith("node_modules/"),
  );
  if (!hasDist) {
    logError("npm pack dry-run did not list dist/ contents.");
    logInfo("Ensure prepublishOnly/tsc:build ran and files[] includes dist/.");
    return { ok: false };
  }
  if (!hasPackageJson) {
    logError("npm pack dry-run did not list package.json.");
    return { ok: false };
  }
  if (hasSecret) {
    logError("npm pack dry-run unexpectedly includes .env or node_modules.");
    return { ok: false };
  }
  logOk(`Pack smoke OK (${paths.length} path(s) listed).`);
  return { ok: true };
}

/**
 * Full pack smoke: ensure build → dry-run → assert.
 *
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * if (!packSmoke().ok) process.exit(1);
 */
export function packSmoke() {
  if (!ensureDistBuilt().ok) {
    return { ok: false };
  }
  logGo("npm pack --dry-run");
  let paths;
  try {
    paths = listPackDryRunPaths();
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    return { ok: false };
  }
  if (paths.length === 0) {
    logError("npm pack --dry-run returned no file paths.");
    return { ok: false };
  }
  return assertPackSmokePaths(paths);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📦 npm pack smoke");
  if (!packSmoke().ok) {
    process.exit(1);
  }
  boxDone("npm pack smoke");
}
