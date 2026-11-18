#!/usr/bin/env node

/** ==============================================================
 * 📦 Pending Changeset files
 * ---------------------------------------------------------------
 * Lists consumer pending files under `.changeset/` (the markdown
 * notes humans create with `changeset:add`). Skips `config.json`
 * and README-style docs so publish/finish gates only see real
 * bump intent. Import from git-flow publish helpers, or run as a
 * CLI to print the paths.
 *
 * HOW TO RUN:
 *   node .devenv/deps/changeset/pending.mjs
 *   import { listPendingChangesetFiles, hasPendingChangesets } from "...";
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Helpers for detecting pending Changeset consumer files.
 *
 * @module changeset-pending
 *
 * @example
 * import { hasPendingChangesets } from "./pending.mjs";
 * if (!hasPendingChangesets()) {
 *   console.error("Run npm run changeset:add first");
 * }
 */

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxBanner, boxDone, logInfo, logOk, logSkip, repoRoot } from "../../lib/tool-lib.mjs";

/**
 * Absolute path to the repo `.changeset/` directory.
 *
 * @returns {string} Directory path.
 *
 * @example
 * changesetDirPath(); // ".../ts-blueprint/.changeset"
 */
export function changesetDirPath() {
  return path.join(repoRoot, ".changeset");
}

/**
 * Whether a `.changeset/` filename is a pending consumer note.
 *
 * Config and README files are never treated as pending bumps.
 *
 * @param {string} fileName - Basename only (not a full path).
 * @returns {boolean} True when this file counts as pending intent.
 *
 * @example
 * isPendingChangesetFile("funny-lions-sing.md"); // true
 * isPendingChangesetFile("config.json");         // false
 * isPendingChangesetFile("README.md");           // false
 */
export function isPendingChangesetFile(fileName) {
  const base = path.basename(fileName);
  if (!base.endsWith(".md")) {
    return false;
  }
  const lower = base.toLowerCase();
  if (lower === "readme.md") {
    return false;
  }
  return true;
}

/**
 * Lists pending `.changeset/*.md` consumer files (absolute paths).
 *
 * Returns an empty array when the directory is missing.
 *
 * @returns {string[]} Absolute paths to pending notes.
 *
 * @example
 * const files = listPendingChangesetFiles();
 * // [ ".../.changeset/funny-lions-sing.md" ]
 */
export function listPendingChangesetFiles() {
  const dir = changesetDirPath();
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((name) => isPendingChangesetFile(name))
    .map((name) => path.join(dir, name))
    .sort();
}

/**
 * Whether at least one pending Changeset consumer file exists.
 *
 * @returns {boolean} True when publish may proceed past the gate.
 *
 * @example
 * hasPendingChangesets(); // true when .changeset/*.md notes exist
 */
export function hasPendingChangesets() {
  return listPendingChangesetFiles().length > 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📦 pending changesets");
  const files = listPendingChangesetFiles();
  if (files.length === 0) {
    logSkip("No pending .changeset/*.md files.");
  } else {
    logOk(`${files.length} pending changeset file(s):`);
    for (const file of files) {
      logInfo(path.relative(repoRoot, file));
    }
  }
  boxDone("pending changesets");
}
