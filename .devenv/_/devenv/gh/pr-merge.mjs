#!/usr/bin/env node

/** ==============================================================
 * 🔀 Merge pull request
 * ---------------------------------------------------------------
 * Merges a pull request with gh pr merge --merge.
 * Set DRY_RUN=true to print the command and skip the merge.
 *
 * HOW TO RUN:
 *   node .devenv/_/devenv/gh/pr-merge.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Merges one GitHub pull request after a confirmation.
 *
 * @module pr-merge
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
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

const bodyFile = process.env.BODY_FILE || path.join(repoRoot, ".github", "MERGE_PR_BODY.md");
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

boxBanner("🔀 merge pull request");
try {
  run("gh auth status", { inherit: false });
} catch {
  logError("gh is not authenticated. Run: node .devenv/_/devenv/gh/auth-setup.mjs");
  process.exit(1);
}

let body = "";
try {
  body = readFileSync(bodyFile, "utf8");
} catch {
  logError(`Merge body not found: ${bodyFile}`);
  process.exit(1);
}
if (!body.trim()) {
  logError(`Merge body is empty: ${bodyFile}`);
  process.exit(1);
}

/** @type {{ number: number, title: string }[]} */
let pulls;
try {
  pulls = JSON.parse(
    gh(["pr", "list", "--state", "open", "--limit", "20", "--json", "number,title"]),
  );
} catch {
  pulls = [];
}
pulls.forEach((pull, index) => {
  logInfo(`${index + 1}. #${pull.number} ${pull.title}`);
});

let number = "";
if (isInteractive() && !dryRun) {
  const rl = readline.createInterface({ input, output });
  try {
    number = (await rl.question("Pull request number: ")).trim().replace(/^#/, "");
  } finally {
    rl.close();
  }
} else if (pulls[0]) {
  number = String(pulls[0].number);
  logInfo(`Using #${number}`);
}
if (!/^\d+$/.test(number)) {
  logError("A numeric pull request number is required.");
  process.exit(1);
}

let details;
try {
  details = gh(["pr", "view", number, "--json", "number,title,state,headRefName,baseRefName"]);
  logInfo(details);
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const args = ["pr", "merge", number, "--merge", "--body-file", bodyFile];
logGo(`gh ${args.map((part) => JSON.stringify(part)).join(" ")}`);
if (dryRun) {
  logSkip("DRY_RUN. Pull request was not merged.");
  boxDone("merge pull request");
  process.exit(0);
}
if (!(await askYesNo(`Merge pull request #${number}?`, false))) {
  logSkip("Cancelled.");
  process.exit(0);
}

try {
  logOk(gh(args).trim() || `Merged #${number}`);
  boxDone("merge pull request");
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
