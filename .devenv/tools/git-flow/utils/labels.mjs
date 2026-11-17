#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Git Flow default labels
 * ---------------------------------------------------------------
 * Default Git Flow labels for issue/PR create, plus an optional
 * TTY multi-select that only adds extras (never removes defaults).
 *
 * HOW TO RUN:
 *   imported by issue-gate / publish-flow
 *   node .devenv/tools/git-flow/utils/labels.mjs --defaults feature
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Label helpers for Git Flow issue and PR create.
 *
 * @module git-flow-labels
 *
 * @example
 * import { defaultLabelsForGitFlowType, mergeLabelLists } from "./labels.mjs";
 * mergeLabelLists(["✨ Feature Request"], defaultLabelsForGitFlowType("feature"));
 */

import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  isInteractive,
  logError,
  logInfo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../../lib/tool-lib.mjs";

/**
 * @typedef {"feature" | "bugfix" | "release" | "hotfix" | "support"} GitFlowType
 */

/** @type {Record<GitFlowType, string>} */
const GIT_FLOW_LABEL_BY_TYPE = {
  feature: "🌟 Git Flow: Feature",
  bugfix: "🐛 Git Flow: Bugfix",
  hotfix: "🩹 Git Flow: Hotfix",
  release: "🚀 Git Flow: Release",
  support: "🛟 Git Flow: Support",
};

/**
 * Default Git Flow label names for a branch type.
 *
 * @param {GitFlowType | string} type - Branch type.
 * @returns {string[]} Zero or one catalog label name.
 *
 * @example
 * defaultLabelsForGitFlowType("feature"); // ["🌟 Git Flow: Feature"]
 */
export function defaultLabelsForGitFlowType(type) {
  const name = GIT_FLOW_LABEL_BY_TYPE[/** @type {GitFlowType} */ (type)];
  return name ? [name] : [];
}

/**
 * Merges label lists, preserving first-seen order and dropping empties.
 *
 * @param {...(string[] | undefined)} lists - Label name lists.
 * @returns {string[]} Unique names.
 *
 * @example
 * mergeLabelLists(["✨ Feature Request"], ["🌟 Git Flow: Feature"]);
 */
export function mergeLabelLists(...lists) {
  /** @type {string[]} */
  const out = [];
  const seen = new Set();
  for (const list of lists) {
    if (!Array.isArray(list)) {
      continue;
    }
    for (const raw of list) {
      const name = String(raw ?? "").trim();
      if (!name || seen.has(name)) {
        continue;
      }
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}

/**
 * Appends `--label` flags for each name onto a gh argv array.
 *
 * @param {string[]} args - Mutable gh argv.
 * @param {string[]} labels - Label names.
 * @returns {string[]} The same args array.
 *
 * @example
 * appendLabelArgs(["issue", "create"], ["🌟 Git Flow: Feature"]);
 */
export function appendLabelArgs(args, labels) {
  for (const label of labels) {
    args.push("--label", label);
  }
  return args;
}

/**
 * TTY multi-select for extra labels; never removes `alreadySelected`.
 *
 * @param {string[]} [alreadySelected] - Defaults that stay applied.
 * @returns {Promise<string[]>} Extra labels chosen by the user.
 *
 * @example
 * await promptExtraLabels(["🌟 Git Flow: Feature"]);
 */
export async function promptExtraLabels(alreadySelected = []) {
  if (!isInteractive()) {
    return [];
  }

  let remote;
  try {
    remote = JSON.parse(run(`gh label list --limit 100 --json name`, { inherit: false }));
  } catch {
    logSkip("Could not list labels for the extra picker.");
    return [];
  }

  if (!Array.isArray(remote) || remote.length === 0) {
    logSkip("No remote labels available for the extra picker.");
    return [];
  }

  const locked = new Set(alreadySelected);
  const choices = remote
    .map((row) => String(row?.name ?? "").trim())
    .filter((name) => name && !locked.has(name));

  if (choices.length === 0) {
    logSkip("No extra labels left to pick.");
    return [];
  }

  logInfo("Optional extra labels (defaults already applied):");
  choices.forEach((name, index) => {
    logInfo(`${index + 1}. ${name}`);
  });
  logInfo("0. Done");

  /** @type {string[]} */
  const selected = [];
  const rl = readline.createInterface({ input, output });
  try {
    while (true) {
      const choice = (await rl.question("Select a label number, or 0 to finish: ")).trim();
      if (choice === "0" || choice === "") {
        break;
      }
      const index = Number(choice) - 1;
      if (!Number.isInteger(index) || !choices[index]) {
        logError("Invalid choice.");
        continue;
      }
      const name = choices[index];
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

/**
 * Resolves final labels: defaults + form labels + optional TTY extras.
 *
 * @param {object} options - Resolve options.
 * @param {GitFlowType | string} [options.gitFlowType] - Type for Git Flow default.
 * @param {string[]} [options.formLabels] - Labels from the issue form YAML.
 * @param {boolean} [options.promptExtras=true] - Offer TTY extra picker.
 * @returns {Promise<string[]>} Final unique label list.
 *
 * @example
 * await resolveCreateLabels({ gitFlowType: "feature", formLabels: ["✨ Feature Request"] });
 */
export async function resolveCreateLabels(options = {}) {
  const defaults = mergeLabelLists(
    options.formLabels,
    defaultLabelsForGitFlowType(options.gitFlowType ?? ""),
  );
  const extras = options.promptExtras === false ? [] : await promptExtraLabels(defaults);
  return mergeLabelLists(defaults, extras);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ git-flow labels");
  const args = forwardedArgs();
  if (args[0] === "--defaults" && args[1]) {
    logInfo(defaultLabelsForGitFlowType(args[1]).join(", ") || "(none)");
    boxDone("git-flow labels");
    process.exit(0);
  }
  logInfo(`cwd=${repoRoot}`);
  logError("Usage: node .devenv/tools/git-flow/utils/labels.mjs --defaults <type>");
  process.exit(1);
}
