#!/usr/bin/env node

/** ==============================================================
 * 📜 Changelog
 * ---------------------------------------------------------------
 * Turns conventional-changelog output into Keep a Changelog sections
 * under ## [Unreleased]. Pass --preview to print without writing.
 *
 * HOW TO RUN:
 *   node .devenv/_/tools/changelog/generate.mjs --preview
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Updates CHANGELOG.md from conventional commits.
 *
 * @module changelog-generate
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  boxBanner,
  boxDone,
  logError,
  logInfo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";

const preview = process.argv.includes("--preview");
const countFlag = process.argv.indexOf("--release-count");
const releaseCount = countFlag === -1 ? "0" : process.argv[countFlag + 1] || "0";
const changelogFile = path.join(repoRoot, "CHANGELOG.md");

const sections = {
  feat: "Added",
  fix: "Fixed",
  perf: "Changed",
  refactor: "Changed",
  docs: "Changed",
  style: "Changed",
  test: "Changed",
  build: "Changed",
  ci: "Changed",
  chore: "Changed",
  revert: "Removed",
  security: "Security",
};

boxBanner("📜 changelog");
let raw = "";
try {
  raw = run(
    `npx --no conventional-changelog -p conventionalcommits --release-count ${JSON.stringify(releaseCount)}`,
    { inherit: false },
  );
} catch {
  logError("conventional-changelog-cli is not installed.");
  process.exit(1);
}
if (!raw.trim()) {
  logSkip("No commits to categorize.");
  process.exit(0);
}

/** @type {Map<string, string[]>} */
const grouped = new Map();
for (const line of raw.split(/\r?\n/)) {
  if (!line.startsWith("* ")) {
    continue;
  }
  const typeMatch = line.match(/^\* (?:\[)?([a-z]+)/);
  const type = typeMatch ? typeMatch[1] : "chore";
  const heading = sections[type] || "Changed";
  const message = line
    .replace(/^\* /, "")
    .replace(/^\[[^\]]+\]\([^)]+\): /, "")
    .replace(/^[^(]+\([^)]+\): /, "")
    .replace(/^[^:]+: /, "");
  const text = message.charAt(0).toUpperCase() + message.slice(1);
  const list = grouped.get(heading) || [];
  list.push(text);
  grouped.set(heading, list);
}

let entries = "";
for (const heading of ["Added", "Changed", "Removed", "Fixed", "Security"]) {
  const list = grouped.get(heading);
  if (!list || list.length === 0) {
    continue;
  }
  entries += `### ${heading}\n\n`;
  for (const item of list) {
    entries += `- ${item}\n`;
  }
  entries += "\n";
}
if (!entries) {
  logSkip("No categorized commits.");
  process.exit(0);
}
if (preview) {
  logInfo("Preview:");
  console.log(entries);
  boxDone("changelog");
  process.exit(0);
}

let current = "";
try {
  current = readFileSync(changelogFile, "utf8");
} catch {
  logError(`CHANGELOG.md not found: ${changelogFile}`);
  process.exit(1);
}
const marker = "## [Unreleased]";
const at = current.indexOf(marker);
if (at === -1) {
  logError("CHANGELOG.md has no ## [Unreleased] section.");
  process.exit(1);
}
const next = current.indexOf("\n## ", at + marker.length);
const head = current.slice(0, at + marker.length);
const tail = next === -1 ? "" : current.slice(next);
writeFileSync(changelogFile, `${head}\n\n${entries}${tail.replace(/^\n/, "")}`);
logOk("Updated CHANGELOG.md");
boxDone("changelog");
