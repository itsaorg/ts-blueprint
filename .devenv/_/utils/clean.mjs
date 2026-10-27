#!/usr/bin/env node

/** ==============================================================
 * 🗑️ Clean path
 * ---------------------------------------------------------------
 * Deletes one file or folder under the repo root. Pass --recursive
 * to delete a folder and its contents. Refuses the repo root and .git.
 *
 * HOW TO RUN:
 *   npm run dist:clean
 *   node .devenv/_/utils/clean.mjs --path dist --recursive
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Deletes one repo-relative path. Recursion is opt-in.
 *
 * @module clean
 */

import { rmSync } from "node:fs";
import path from "node:path";
import {
  boxBanner,
  boxDone,
  logError,
  logOk,
  readPackageIdentity,
  repoRoot,
} from "../lib/tool-lib.mjs";

const pathFlag = process.argv.indexOf("--path");
const targetArg = pathFlag === -1 ? "" : process.argv[pathFlag + 1] || "";
const recursive = process.argv.includes("--recursive");

/**
 * Resolves a repo-relative path and rejects escapes.
 *
 * @param {string} input - Path relative to the repo root.
 * @returns {string} Absolute path inside the repo.
 * @throws {Error} When the path is the repo root, outside it, or under `.git`.
 */
function resolveTarget(input) {
  const resolved = path.resolve(repoRoot, input);
  const relative = path.relative(repoRoot, resolved);
  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to delete outside the repo: ${input}`);
  }
  if (relative.split(path.sep)[0] === ".git") {
    throw new Error("Refusing to delete .git");
  }
  return resolved;
}

const { name, version } = readPackageIdentity();
boxBanner(`▶️  clean — ${name}@${version}`);

if (!targetArg || targetArg.startsWith("--")) {
  logError("Pass --path <file-or-folder>.");
  process.exit(1);
}

let target = "";
try {
  target = resolveTarget(targetArg);
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

try {
  rmSync(target, { force: true, recursive });
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const shown = path.relative(repoRoot, target).split(path.sep).join("/");
logOk(`removed ${shown}`);
boxDone("clean");
