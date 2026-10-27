#!/usr/bin/env node

/** ==============================================================
 * 🔀 Create pull request
 * ---------------------------------------------------------------
 * Creates a pull request from .github/PR_BODY.md.
 * Set DRY_RUN=true to print the command and skip creation.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/pr-create.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Creates a GitHub pull request from the PR body file.
 *
 * @module pr-create
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  askYesNo,
  boxBanner,
  boxDone,
  logError,
  logGo,
  logInfo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";

const bodyFile = process.env.BODY_FILE || path.join(repoRoot, ".github", "PR_BODY.md");
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

boxBanner("🔀 create pull request");
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
  logError(`PR body not found: ${bodyFile}`);
  process.exit(1);
}
const titleLine = text.split(/\r?\n/).find((row) => row.startsWith("# ")) || "";
const title = titleLine.replace(/^# /, "").trim();
if (!title) {
  logError("Could not parse a title. Expected a Markdown H1.");
  process.exit(1);
}

let head;
try {
  head = run("git branch --show-current", { inherit: false });
} catch {
  logError("Could not read the current branch.");
  process.exit(1);
}
if (!head) {
  logError("Could not read the current branch.");
  process.exit(1);
}
let base = "main";
try {
  const remote = run("git remote show origin", { inherit: false });
  const match = remote.match(/HEAD branch: (\S+)/);
  if (match) {
    base = match[1];
  }
} catch {
  logInfo("Using base branch main.");
}

logInfo(`Title: ${title}`);
logInfo(`Head: ${head}`);
logInfo(`Base: ${base}`);
const args = [
  "pr",
  "create",
  "--title",
  title,
  "--body-file",
  bodyFile,
  "--base",
  base,
  "--head",
  head,
];
logGo(`gh ${args.map((part) => JSON.stringify(part)).join(" ")}`);

if (dryRun) {
  logSkip("DRY_RUN. Pull request was not created.");
  boxDone("create pull request");
  process.exit(0);
}

if (!(await askYesNo("Create this pull request?", false))) {
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
  logOk("Cleared the PR body file.");
  boxDone("create pull request");
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
