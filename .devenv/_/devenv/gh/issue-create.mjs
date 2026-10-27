#!/usr/bin/env node

/** ==============================================================
 * 🐛 Create issue
 * ---------------------------------------------------------------
 * Creates a GitHub issue from .github/ISSUE_BODY.md.
 * Set DRY_RUN=true to print the command and skip creation.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/issue-create.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Creates a GitHub issue from the issue body file.
 *
 * @module issue-create
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  askYesNo,
  boxBanner,
  boxDone,
  isInteractive,
  logError,
  logGo,
  logInfo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";

const bodyFile = process.env.BODY_FILE || path.join(repoRoot, ".github", "ISSUE_BODY.md");
const dryRun = process.env.DRY_RUN === "true";

/**
 * @param {string[]} args - Arguments after gh.
 * @returns {string} Stdout.
 */
function gh(args) {
  return execFileSync("gh", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/**
 * @param {string} text - Issue body.
 * @returns {string} Parsed title.
 */
function parseTitle(text) {
  const line = text.split(/\r?\n/).find((row) => /^# `/.test(row)) || "";
  const match = line.match(/^# `([^`]+)`: (.*)$/);
  return match ? `${match[1]}: ${match[2]}` : "";
}

/**
 * @param {string} text - Issue body.
 * @returns {string[]} Assignee logins.
 */
function parseAssignees(text) {
  const names = [];
  let inSection = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^## .*Assignees/.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && /^## /.test(line)) {
      break;
    }
    const match = inSection ? line.match(/^- @([A-Za-z0-9_-]+)/) : null;
    if (match) {
      names.push(match[1]);
    }
  }
  return names;
}

/**
 * @returns {Promise<string[]>} Selected label names.
 */
async function selectLabels() {
  if (!isInteractive() || dryRun) {
    logSkip("Label picker skipped.");
    return [];
  }
  let labels;
  try {
    labels = JSON.parse(gh(["label", "list", "--limit", "100", "--json", "name,description"]));
  } catch {
    logSkip("Could not list labels.");
    return [];
  }
  const selected = [];
  const rl = readline.createInterface({ input, output });
  try {
    labels.forEach((label, index) => {
      logInfo(`${index + 1}. ${label.name}`);
    });
    logInfo("0. Done");
    while (true) {
      const choice = (await rl.question("Select a label number, or 0 to finish: ")).trim();
      if (choice === "0" || choice === "") {
        break;
      }
      const index = Number(choice) - 1;
      if (!Number.isInteger(index) || !labels[index]) {
        logError("Invalid choice.");
        continue;
      }
      const name = labels[index].name;
      const at = selected.indexOf(name);
      if (at === -1) {
        selected.push(name);
        logOk(`Selected: ${name}`);
      } else {
        selected.splice(at, 1);
        logInfo(`Deselected: ${name}`);
      }
    }
  } finally {
    rl.close();
  }
  return selected;
}

boxBanner("🐛 create issue");
try {
  run("gh auth status", { inherit: false });
} catch {
  logError("gh is not authenticated. Run: node .devenv/_/devenv/gh/auth-setup.mjs");
  process.exit(1);
}

let text = "";
try {
  text = readFileSync(bodyFile, "utf8");
} catch {
  logError(`Issue body not found: ${bodyFile}`);
  process.exit(1);
}
if (!text.trim()) {
  logError(`Issue body is empty: ${bodyFile}`);
  process.exit(1);
}

const title = parseTitle(text);
if (!title) {
  logError("Could not parse a title. Expected: # `tag`: Title");
  process.exit(1);
}
const assignees = parseAssignees(text);
const labels = await selectLabels();
logInfo(`Title: ${title}`);
logInfo(`Labels: ${labels.join(", ") || "(none)"}`);
logInfo(`Assignees: ${assignees.join(", ") || "(none)"}`);

const args = ["issue", "create", "--title", title, "--body-file", bodyFile];
for (const label of labels) {
  args.push("--label", label);
}
for (const assignee of assignees) {
  args.push("--assignee", assignee);
}
logGo(`gh ${args.map((part) => JSON.stringify(part)).join(" ")}`);

if (dryRun) {
  logSkip("DRY_RUN. Issue was not created.");
  boxDone("create issue");
  process.exit(0);
}

if (!(await askYesNo("Create this issue?", false))) {
  logSkip("Cancelled.");
  process.exit(0);
}

try {
  const created = gh(args).trim();
  logOk(created);
  writeFileSync(
    bodyFile,
    "<!--\n Copyright 2026 Astitv Singh <https://github.com/astitvsingh>.\n SPDX-License-Identifier: Apache-2.0\n-->\n",
  );
  logOk("Cleared the issue body file.");
  boxDone("create issue");
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
