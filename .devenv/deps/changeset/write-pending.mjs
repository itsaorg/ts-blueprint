#!/usr/bin/env node

/** ==============================================================
 * 📝 Guided pending Changeset write
 * ---------------------------------------------------------------
 * Writes one pending `.changeset/<human-id>.md` via `@changesets/write`
 * so filenames stay Changesets-canonical. Used by git-flow publish
 * orchestration (feature major|minor; others patch). Same branch
 * allow-list as `changeset:add`.
 *
 * HOW TO RUN:
 *   imported by publish-flow
 *   node .devenv/deps/changeset/write-pending.mjs --bump minor --summary "Add export"
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Guided pending Changeset writer.
 *
 * @module changeset-write-pending
 *
 * @example
 * import { writePendingChangeset } from "./write-pending.mjs";
 * await writePendingChangeset({ bump: "minor", summary: "Add export" });
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logInfo,
  logOk,
  repoRoot,
} from "../../lib/tool-lib.mjs";
import { isChangesetAddAllowedBranch, currentBranchName } from "./add.mjs";

const require = createRequire(import.meta.url);

/**
 * Reads the root package name for the releases front matter.
 *
 * @returns {string} Package name, or empty string.
 */
export function readPackageName() {
  try {
    const raw = readFileSync(path.join(repoRoot, "package.json"), "utf8");
    return String(JSON.parse(raw).name ?? "");
  } catch {
    return "";
  }
}

/**
 * Whether a bump string is a valid Changesets release type.
 *
 * @param {string} bump - Candidate bump.
 * @returns {boolean} True for major|minor|patch.
 *
 * @example
 * isValidBump("minor"); // true
 */
export function isValidBump(bump) {
  return bump === "major" || bump === "minor" || bump === "patch";
}

/**
 * Writes one pending Changeset with canonical human-id filename.
 *
 * @param {{ bump: "major" | "minor" | "patch", summary: string }} options - Write options.
 * @returns {Promise<{ ok: boolean, id?: string, path?: string }>} Outcome.
 *
 * @example
 * await writePendingChangeset({ bump: "minor", summary: "Add export API" });
 */
export async function writePendingChangeset(options) {
  const branch = currentBranchName();
  if (!isChangesetAddAllowedBranch(branch)) {
    logError(`write-pending refused on branch "${branch || "(detached)"}".`);
    logInfo("Run on feature/*, bugfix/*, hotfix/*, or support/* only.");
    return { ok: false };
  }

  const bump = options?.bump;
  const summary = String(options?.summary ?? "").trim();
  if (!isValidBump(bump)) {
    logError('Pass bump as "major", "minor", or "patch".');
    return { ok: false };
  }
  if (!summary) {
    logError("Pass a non-empty summary for the pending Changeset.");
    return { ok: false };
  }

  const packageName = readPackageName();
  if (!packageName) {
    logError("Could not read package.json name.");
    return { ok: false };
  }

  /** @type {{ writeChangeset: (c: object, cwd: string, opts?: object) => Promise<string> }} */
  let writeMod;
  try {
    writeMod = await import("@changesets/write");
  } catch {
    // Fallback resolve for some install layouts
    writeMod = require("@changesets/write");
  }

  const writeChangeset = writeMod.writeChangeset || writeMod.default;
  if (typeof writeChangeset !== "function") {
    logError("Could not load @changesets/write.");
    return { ok: false };
  }

  try {
    const id = await writeChangeset(
      {
        summary,
        releases: [{ name: packageName, type: bump }],
      },
      repoRoot,
      { format: false },
    );
    const filePath = path.join(repoRoot, ".changeset", `${id}.md`);
    logOk(`Wrote pending Changeset ${id}.md (${bump})`);
    return { ok: true, id, path: filePath };
  } catch (error) {
    logError(`write-pending failed: ${error instanceof Error ? error.message : error}`);
    return { ok: false };
  }
}

/**
 * Parses `--bump` and `--summary` from argv.
 *
 * @param {string[]} args - CLI args.
 * @returns {{ bump?: string, summary?: string }} Parsed pieces.
 */
export function parseWritePendingArgs(args) {
  /** @type {string | undefined} */
  let bump;
  /** @type {string | undefined} */
  let summary;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--bump") {
      bump = args[i + 1];
      i += 1;
      continue;
    }
    if (args[i] === "--summary") {
      summary = args[i + 1];
      i += 1;
    }
  }
  return { bump, summary };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("📝 write-pending");
  const { bump, summary } = parseWritePendingArgs(forwardedArgs());
  const result = await writePendingChangeset({
    bump: /** @type {"major"|"minor"|"patch"} */ (bump),
    summary: summary || "",
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("write-pending");
}
