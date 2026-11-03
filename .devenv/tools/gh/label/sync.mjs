#!/usr/bin/env node

/** ==============================================================
 * ♻️ Sync labels (exclusive, skip no-ops)
 * ---------------------------------------------------------------
 * Syncs a labels JSON catalog to the GitHub repository. Compares
 * each catalog entry to the remote list first: unchanged labels
 * are skipped (no `gh label create --force`). Missing labels are
 * created; changed name/description/color are force-updated.
 * Remote labels missing from the catalog are deleted (exclusive
 * sync). Requires `gh` auth. Destructive for orphans — keep the
 * catalog complete before running.
 *
 * HOW TO RUN:
 *   npm run gh:label:sync
 *   node .devenv/tools/gh/label/sync.mjs .github/labels.json
 *   npm run gh:setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Syncs every label in a JSON catalog and removes orphans.
 *
 * Unchanged remote labels are skipped so prepare/install stays quiet
 * when the catalog already matches GitHub.
 *
 * @module label-sync
 *
 * @example
 * // Default catalog path when omitted:
 * //   npm run gh:label:sync
 * //   node .devenv/tools/gh/label/sync.mjs .github/labels.json
 *
 * @example
 * import { syncLabels } from "./sync.mjs";
 * const summary = syncLabels(".github/labels.json");
 * console.log(summary.skipped);
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  logInfo,
  logOk,
  logSkip,
  repoRoot,
} from "../../../lib/tool-lib.mjs";
import { ghAuthStatus } from "../auth/status.mjs";
import { createLabel } from "./create.mjs";
import { deleteLabel } from "./delete.mjs";
import { listLabels } from "./list.mjs";

/**
 * Normalizes a GitHub label color for equality checks.
 *
 * Strips a leading `#` and lowercases so `#D73A4A` and `d73a4a` match.
 *
 * @param {string | undefined} color - Raw color from catalog or API.
 * @returns {string} Normalized hex without `#`.
 *
 * @example
 * normalizeLabelColor("#D73A4A"); // "d73a4a"
 * normalizeLabelColor("ededed");  // "ededed"
 */
export function normalizeLabelColor(color) {
  return String(color || "ededed")
    .replace(/^#/, "")
    .toLowerCase();
}

/**
 * Whether catalog fields already match a remote label.
 *
 * @param {{ name: string, description?: string, color?: string }} catalog - Desired label.
 * @param {{ name: string, description: string, color: string } | undefined} remote - Remote fields.
 * @returns {boolean} True when no API write is needed.
 *
 * @example
 * labelFieldsMatch(
 *   { name: "bug", description: "Broken", color: "d73a4a" },
 *   { name: "bug", description: "Broken", color: "d73a4a" },
 * ); // true
 */
export function labelFieldsMatch(catalog, remote) {
  if (!remote) {
    return false;
  }
  const catalogDescription = String(catalog.description ?? "");
  const catalogColor = normalizeLabelColor(catalog.color);
  const remoteDescription = String(remote.description ?? "");
  const remoteColor = normalizeLabelColor(remote.color);
  return catalogDescription === remoteDescription && catalogColor === remoteColor;
}

/**
 * Creates or force-updates one label when it differs from remote.
 *
 * @param {{ name: string, description?: string, color?: string }} label - Catalog entry.
 * @param {Map<string, { name: string, description: string, color: string }>} remoteByName - Remote map.
 * @returns {"CREATED" | "UPDATED" | "SKIPPED" | "FAILED"} Status token.
 *
 * @example
 * upsertLabelIfNeeded({ name: "bug", color: "d73a4a" }, remoteByName);
 */
function upsertLabelIfNeeded(label, remoteByName) {
  const name = String(label.name ?? "");
  if (!name) {
    logError("Catalog entry missing name");
    return "FAILED";
  }

  const remote = remoteByName.get(name);
  if (labelFieldsMatch(label, remote)) {
    logSkip(`Unchanged: ${name}`);
    return "SKIPPED";
  }

  logGo(`Upsert label: ${name}`);
  const existed = remoteByName.has(name);
  const status = createLabel(label);
  if (status === "FAILED") {
    return "FAILED";
  }
  if (existed) {
    logOk(`Updated: ${name}`);
    return "UPDATED";
  }
  logOk(`Created: ${name}`);
  return "CREATED";
}

/**
 * Syncs labels from a JSON file. Catalog is authoritative: remote labels
 * not listed are deleted. Unchanged labels are skipped.
 *
 * @param {string} [labelsFile=".github/labels.json"] - Repo-relative or absolute path.
 * @param {{ requireAuth?: boolean }} [options] - When requireAuth is true (default), check gh auth first.
 * @returns {{ created: number, updated: number, skipped: number, deleted: number, failed: number, total: number }} Counts.
 *
 * @example
 * syncLabels(".github/labels.json");
 *
 * @example
 * // Skip auth when an outer setup already verified gh:
 * syncLabels(".github/labels.json", { requireAuth: false });
 */
export function syncLabels(labelsFile = ".github/labels.json", options = {}) {
  const requireAuth = options.requireAuth !== false;
  if (requireAuth) {
    const auth = ghAuthStatus();
    if (!auth.ok) {
      throw new Error("gh is not authenticated. Run: node .devenv/tools/gh/auth/login.mjs");
    }
  }

  const labelsPath = path.isAbsolute(labelsFile) ? labelsFile : path.join(repoRoot, labelsFile);
  logGo(`Read labels file: ${labelsPath}`);
  const labels = JSON.parse(readFileSync(labelsPath, "utf8"));
  if (!Array.isArray(labels)) {
    throw new Error("labels file must contain an array");
  }

  const catalogNames = new Set(labels.map((label) => String(label.name ?? "")).filter(Boolean));
  const remoteList = listLabels();
  /** @type {Map<string, { name: string, description: string, color: string }>} */
  const remoteByName = new Map(remoteList.map((label) => [label.name, label]));

  const summary = {
    created: 0,
    updated: 0,
    skipped: 0,
    deleted: 0,
    failed: 0,
    total: labels.length,
  };

  for (const label of labels) {
    const status = upsertLabelIfNeeded(label, remoteByName);
    if (status === "CREATED") {
      summary.created += 1;
    } else if (status === "UPDATED") {
      summary.updated += 1;
    } else if (status === "SKIPPED") {
      summary.skipped += 1;
    } else {
      summary.failed += 1;
    }
  }

  logGo("Remove labels not in catalog");
  for (const name of remoteByName.keys()) {
    if (catalogNames.has(name)) {
      continue;
    }
    logGo(`Delete orphan label: ${name}`);
    const status = deleteLabel(name);
    if (status === "OK") {
      summary.deleted += 1;
      logInfo(`${name}: DELETED`);
    } else {
      summary.failed += 1;
      logInfo(`${name}: FAILED`);
    }
  }

  if (
    summary.created === 0 &&
    summary.updated === 0 &&
    summary.deleted === 0 &&
    summary.failed === 0
  ) {
    logSkip(`Labels already match catalog (${summary.skipped} unchanged, 0 orphans).`);
  } else {
    logInfo(
      `Created ${summary.created}, updated ${summary.updated}, skipped ${summary.skipped}, deleted ${summary.deleted}, failed ${summary.failed}, total ${summary.total}.`,
    );
  }
  return summary;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ sync labels");
  try {
    const file = process.argv[2] || ".github/labels.json";
    const summary = syncLabels(file);
    if (summary.failed > 0) {
      process.exit(1);
    }
    boxDone("sync labels");
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
