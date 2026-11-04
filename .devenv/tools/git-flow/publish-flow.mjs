#!/usr/bin/env node

/** ==============================================================
 * 🚀 Git Flow publish + pull request
 * ---------------------------------------------------------------
 * Shared publish path for feature/bugfix/release/hotfix/support:
 * (1) require pending `.changeset/*.md` files, (2) push the topic
 * branch (`git flow <type> publish` or plain push for support —
 * AVH has no `support publish`), (3) ensure a GitHub pull request
 * exists into the default base (idempotent if one is already open).
 * Seeds `Closes #N` when the branch name starts with digits.
 * Interactive prompts for support base / ambiguous issue linkage.
 * Never merges locally. Never runs `git flow <type> finish`.
 *
 * HOW TO RUN:
 *   imported by git-flow type publish.mjs modules
 *   node .devenv/tools/git-flow/publish-flow.mjs feature
 *   node .devenv/tools/git-flow/publish-flow.mjs support --base main
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * PR-creating publish for Git Flow topic and support branches.
 *
 * @module git-flow-publish-flow
 *
 * @example
 * import { publishWithPullRequest } from "../publish-flow.mjs";
 * await publishWithPullRequest("feature");
 *
 * @example
 * // CLI:
 * //   node .devenv/tools/git-flow/publish-flow.mjs hotfix
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { hasPendingChangesets, listPendingChangesetFiles } from "../../deps/changeset/pending.mjs";
import {
  askYesNo,
  boxBanner,
  boxDone,
  forwardedArgs,
  isInteractive,
  logError,
  logGo,
  logInfo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../lib/tool-lib.mjs";
import { currentBranch, pushCurrentBranch, runGitFlow, stripTypePrefix } from "./command.mjs";
import { isGitFlowInstalled } from "./isInstalled.mjs";

/**
 * @typedef {"feature" | "bugfix" | "release" | "hotfix" | "support"} PublishableType
 */

/**
 * Default PR base for a Git Flow type.
 *
 * @param {PublishableType} type - Branch type.
 * @returns {string} Base branch (`develop`, `main`).
 *
 * @example
 * defaultBaseFor("feature"); // "develop"
 * defaultBaseFor("hotfix");  // "main"
 * defaultBaseFor("support"); // "main"
 */
export function defaultBaseFor(type) {
  if (type === "feature" || type === "bugfix") {
    return "develop";
  }
  return "main";
}

/**
 * Parses a leading issue number from a branch short name.
 *
 * Expects `<number>-<slug>` after the type prefix
 * (e.g. `42-add-login` → `42`). Semver release/hotfix names return null.
 *
 * @param {string} shortName - Name without `type/` prefix.
 * @returns {string | null} Issue number digits, or null.
 *
 * @example
 * parseIssueNumberFromName("42-add-login"); // "42"
 * parseIssueNumberFromName("1.2.0");        // null
 */
export function parseIssueNumberFromName(shortName) {
  const match = String(shortName).match(/^(\d+)-/);
  return match ? match[1] : null;
}

/**
 * Ensures `gh` is available and authenticated.
 *
 * @returns {boolean} True when ready for `gh pr` commands.
 *
 * @example
 * if (!ghReady()) {
 *   console.log("Open the PR manually with gh pr create");
 * }
 */
export function ghReady() {
  try {
    run("gh auth status", { inherit: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * Asks for a single line of text on a TTY.
 *
 * @param {string} label - Prompt label (without emoji; added here).
 * @param {string} [defaultValue=""] - Value when the user presses Enter.
 * @returns {Promise<string>} Trimmed answer (may be empty).
 *
 * @example
 * const base = await askLine("PR base branch", "main");
 */
export async function askLine(label, defaultValue = "") {
  const hint = defaultValue ? ` [${defaultValue}]` : "";
  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question(`❓ ${label}${hint}: `)).trim();
    return answer || defaultValue;
  } finally {
    rl.close();
  }
}

/**
 * Reads `package.json` version from the repo root.
 *
 * @returns {string} Semver string, or empty on failure.
 *
 * @example
 * readPackageVersion(); // "0.0.0"
 */
export function readPackageVersion() {
  try {
    const raw = readFileSync(path.join(repoRoot, "package.json"), "utf8");
    const parsed = JSON.parse(raw);
    return String(parsed.version ?? "");
  } catch {
    return "";
  }
}

/**
 * Whether argv includes `--allow-no-changeset`.
 *
 * @param {string[]} args - CLI args.
 * @returns {boolean} True when the bypass flag is present.
 *
 * @example
 * hasAllowNoChangesetFlag(["--allow-no-changeset"]); // true
 */
export function hasAllowNoChangesetFlag(args) {
  return args.includes("--allow-no-changeset");
}

/**
 * Fails publish when bump intent is missing (policy C).
 *
 * For `feature` / `bugfix` / `support`: require ≥1 pending `.changeset/*.md`.
 * For `release` / `hotfix`: pending files **or** `changeset:version` already
 * applied (`package.json` version matches the branch version segment).
 *
 * Bypass: `--allow-no-changeset` **or** interactive TTY confirm (default no).
 * Non-TTY without the flag refuses.
 *
 * @param {PublishableType} type - Branch type.
 * @param {string} shortName - Name without `type/` prefix.
 * @param {{ allowNoChangeset?: boolean }} [options] - Bypass options.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * if (!(await requirePublishChangesetGate("feature", "42-x")).ok) return { ok: false };
 * await requirePublishChangesetGate("feature", "docs", { allowNoChangeset: true });
 */
export async function requirePublishChangesetGate(type, shortName, options = {}) {
  if (hasPendingChangesets()) {
    const files = listPendingChangesetFiles();
    logOk(`Pending changeset gate passed (${files.length} file(s)).`);
    return { ok: true };
  }

  if (type === "release" || type === "hotfix") {
    const pkgVersion = readPackageVersion();
    if (pkgVersion && pkgVersion === shortName) {
      logOk(`No pending changesets; package.json already at ${pkgVersion} (version applied).`);
      return { ok: true };
    }
  }

  logError("No pending .changeset/*.md files found (or release/hotfix version mismatch).");
  logInfo("Create one first: npm run changeset:add");
  if (type === "release" || type === "hotfix") {
    logInfo(`Or run changeset:version so package.json matches "${shortName}".`);
  }
  logInfo("Chore/docs/empty support: pass --allow-no-changeset or confirm interactively.");

  if (options.allowNoChangeset) {
    logSkip("Bypassing pending-changeset gate (--allow-no-changeset).");
    return { ok: true };
  }
  if (isInteractive()) {
    const yes = await askYesNo("Publish without a pending changeset?", false);
    if (yes) {
      logSkip("Bypassing pending-changeset gate (interactive confirm).");
      return { ok: true };
    }
  } else {
    logInfo("Non-interactive shell: re-run with --allow-no-changeset to bypass.");
  }
  return { ok: false };
}

/**
 * Pushes the branch for the given Git Flow type.
 *
 * Uses `git flow <type> publish` when AVH supports it. Support has
 * no upstream publish subcommand, so it falls back to `git push -u`.
 *
 * @param {PublishableType} type - Branch type.
 * @param {string[]} [nameArgs] - Optional short name args for git-flow.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * pushForType("feature", ["42-add-login"]);
 * pushForType("support", []);
 */
export function pushForType(type, nameArgs = []) {
  if (type === "support") {
    logInfo("Git Flow AVH has no `support publish` — pushing with git push -u.");
    return pushCurrentBranch();
  }
  return runGitFlow(type, "publish", nameArgs);
}

/**
 * Looks up an open PR for the current head branch.
 *
 * @param {string} headBranch - Full branch name (e.g. feature/42-x).
 * @returns {{ number: number, url: string } | null} Open PR or null.
 *
 * @example
 * findOpenPullRequest("feature/42-add-login");
 */
export function findOpenPullRequest(headBranch) {
  try {
    const raw = run(
      `gh pr list --head ${JSON.stringify(headBranch)} --state open --json number,url --limit 1`,
      {
        inherit: false,
      },
    );
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }
    const first = parsed[0];
    return { number: Number(first.number), url: String(first.url) };
  } catch {
    return null;
  }
}

/**
 * Builds a PR body that includes Closes #N when an issue is known.
 *
 * @param {string | null} issueNumber - Digits from the branch name.
 * @returns {string} Body text for `gh pr create --body`.
 *
 * @example
 * buildPullRequestBody("42"); // includes "Closes #42"
 */
export function buildPullRequestBody(issueNumber) {
  const lines = [
    "## Summary",
    "",
    "<!-- Why this change is needed. -->",
    "",
    "## Linked issues",
    "",
  ];
  if (issueNumber) {
    lines.push(`Closes #${issueNumber}`);
  } else {
    lines.push("<!-- Closes #N when this PR finishes that issue. -->");
  }
  lines.push("", "## Test plan", "", "- [ ] `npm run check`", "");
  return lines.join("\n");
}

/**
 * Creates a pull request when none is open for the head branch.
 *
 * @param {object} options - Create options.
 * @param {string} options.headBranch - Current topic branch.
 * @param {string} options.base - Target base branch.
 * @param {string | null} options.issueNumber - Optional issue digits.
 * @returns {{ ok: boolean, created?: boolean, url?: string }} Outcome.
 *
 * @example
 * await ensurePullRequest({ headBranch: "feature/42-x", base: "develop", issueNumber: "42" });
 */
export async function ensurePullRequest(options) {
  const { headBranch, base, issueNumber } = options;

  if (!ghReady()) {
    logSkip("gh is not authenticated. Push succeeded; open a PR manually:");
    logInfo(`gh pr create --base ${base} --fill`);
    if (issueNumber) {
      logInfo(`Include in the body: Closes #${issueNumber}`);
    }
    return { ok: true, created: false };
  }

  const existing = findOpenPullRequest(headBranch);
  if (existing) {
    logSkip(`Open PR already exists: ${existing.url}`);
    return { ok: true, created: false, url: existing.url };
  }

  let resolvedIssue = issueNumber;
  if (!resolvedIssue && isInteractive()) {
    const typed = await askLine("Issue number to close (blank to skip)", "");
    resolvedIssue = typed && /^\d+$/.test(typed) ? typed : null;
  }

  const body = buildPullRequestBody(resolvedIssue);
  const title = headBranch.includes("/")
    ? headBranch.slice(headBranch.indexOf("/") + 1)
    : headBranch;

  logGo(`gh pr create --base ${base} --title … --body …`);
  const result = spawnSync(
    "gh",
    ["pr", "create", "--base", base, "--title", title, "--body", body],
    { cwd: repoRoot, stdio: "inherit" },
  );
  if ((result.status ?? 1) !== 0) {
    logError("gh pr create failed");
    logInfo("Push succeeded; open or update the PR on GitHub.");
    return { ok: false };
  }
  logOk(`Pull request opened into ${base}`);
  return { ok: true, created: true };
}

/**
 * Resolves the PR base branch (flag, default, or interactive for support).
 *
 * @param {PublishableType} type - Branch type.
 * @param {string | undefined} baseFlag - Explicit `--base` value.
 * @returns {Promise<string>} Base branch name.
 *
 * @example
 * await resolvePublishBase("support", undefined); // may prompt
 */
export async function resolvePublishBase(type, baseFlag) {
  if (baseFlag) {
    return baseFlag;
  }
  const fallback = defaultBaseFor(type);
  if (type === "support" && isInteractive()) {
    return askLine("PR base branch for this support publish", fallback);
  }
  return fallback;
}

/**
 * Full publish: pending gate → push → ensure PR.
 *
 * @param {PublishableType} type - Branch type.
 * @param {{ base?: string, nameArgs?: string[], allowNoChangeset?: boolean }} [options] - Overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await publishWithPullRequest("feature");
 * await publishWithPullRequest("support", { base: "main", allowNoChangeset: true });
 */
export async function publishWithPullRequest(type, options = {}) {
  if (type !== "support" && !isGitFlowInstalled().ok) {
    return { ok: false };
  }
  if (type === "support" && !isGitFlowInstalled().ok) {
    logSkip("Git Flow AVH missing — support publish still pushes with git.");
  }

  const branch = currentBranch();
  if (!branch) {
    logError("Could not determine current branch");
    return { ok: false };
  }
  if (!branch.startsWith(`${type}/`)) {
    logError(`Current branch "${branch}" is not a ${type}/ branch`);
    return { ok: false };
  }

  const shortName = stripTypePrefix(type, branch);
  if (
    !(
      await requirePublishChangesetGate(type, shortName, {
        allowNoChangeset: Boolean(options.allowNoChangeset),
      })
    ).ok
  ) {
    return { ok: false };
  }

  let nameArgs = options.nameArgs;
  if (!nameArgs || nameArgs.length === 0) {
    nameArgs = [shortName];
  }

  if (!pushForType(type, nameArgs).ok) {
    return { ok: false };
  }

  const base = await resolvePublishBase(type, options.base);
  const issueNumber = parseIssueNumberFromName(shortName);

  const pr = await ensurePullRequest({ headBranch: branch, base, issueNumber });
  if (!pr.ok) {
    return { ok: false };
  }

  logInfo("After review + merge on GitHub, run the matching finish script to clean up.");
  logInfo(`Do not run: git flow ${type} finish`);
  return { ok: true };
}

/**
 * Parses `--base <branch>` and `--allow-no-changeset` from argv.
 *
 * @param {string[]} args - CLI args.
 * @returns {{ base?: string, allowNoChangeset: boolean, rest: string[] }} Parsed pieces.
 *
 * @example
 * parseBaseArgs(["--base", "develop", "--allow-no-changeset", "42-x"]);
 * // { base: "develop", allowNoChangeset: true, rest: ["42-x"] }
 */
export function parseBaseArgs(args) {
  const rest = [];
  /** @type {string | undefined} */
  let base;
  let allowNoChangeset = false;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--base") {
      base = args[i + 1];
      i += 1;
      continue;
    }
    if (args[i] === "--allow-no-changeset") {
      allowNoChangeset = true;
      continue;
    }
    rest.push(args[i]);
  }
  return { base, allowNoChangeset, rest };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🚀 git-flow publish-flow");
  const args = forwardedArgs();
  const type = /** @type {PublishableType | undefined} */ (args[0]);
  const allowed = new Set(["feature", "bugfix", "release", "hotfix", "support"]);
  if (!type || !allowed.has(type)) {
    logError("Pass a type: feature | bugfix | release | hotfix | support");
    process.exit(1);
  }
  const { base, allowNoChangeset, rest } = parseBaseArgs(args.slice(1));
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await publishWithPullRequest(type, {
    base,
    allowNoChangeset,
    nameArgs: rest.length > 0 ? rest : undefined,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git-flow publish-flow");
}
