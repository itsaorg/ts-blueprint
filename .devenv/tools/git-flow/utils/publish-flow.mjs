#!/usr/bin/env node

/** ==============================================================
 * 🚀 Git Flow publish + pull request
 * ---------------------------------------------------------------
 * Shared publish path for feature/bugfix/release/hotfix/support:
 * (1) require pending `.changeset/*.md` files, (2) push the topic
 * branch (`git flow <type> publish` or plain push for support —
 * AVH has no `support publish`), (3) ensure a GitHub pull request
 * exists into the default base. Lists open PRs for the head and
 * picks one when several exist; creates via `.git/PR_EDITMSG` when
 * none. Seeds `Closes #N` from the branch name or `.git/CURRENT_ISSUE`.
 * Never merges (finish owns approve/CI/merge). Never runs
 * `git flow <type> finish`.
 *
 * HOW TO RUN:
 *   imported by git-flow type publish.mjs modules
 *   node .devenv/tools/git-flow/utils/publish-flow.mjs feature
 *   node .devenv/tools/git-flow/utils/publish-flow.mjs support --base main
 *   node .devenv/tools/git-flow/utils/publish-flow.mjs feature --body-file ./pr.md
 *   node .devenv/tools/git-flow/utils/publish-flow.mjs feature --pr 25
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
 * //   node .devenv/tools/git-flow/utils/publish-flow.mjs hotfix
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import {
  hasPendingChangesets,
  listPendingChangesetFiles,
} from "../../../deps/changeset/pending.mjs";
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
} from "../../../lib/tool-lib.mjs";
import { currentBranch, pushCurrentBranch, runGitFlow, stripTypePrefix } from "./command.mjs";
import {
  injectClosesIssue,
  openDraftInEditor,
  parseMarkdownTitle,
  resetFileToTemplate,
  seedDraftFromTemplate,
  summaryIsFilled,
} from "./edit-draft.mjs";
import { isOnTypeBranch } from "./gates.mjs";
import { isGitFlowInstalled } from "../isInstalled.mjs";
import { appendLabelArgs, resolveCreateLabels } from "./labels.mjs";
import { readCurrentIssue } from "./start-gates.mjs";

const PR_TEMPLATE = path.join(
  repoRoot,
  ".github",
  "PULL_REQUEST_TEMPLATE",
  "pull_request_template.md",
);
const PR_EDITMSG = path.join(repoRoot, ".git", "PR_EDITMSG");

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
 * Lists open PRs for a head branch.
 *
 * @param {string} headBranch - Full branch name (e.g. feature/42-x).
 * @returns {{ number: number, url: string, title: string }[]} Open PRs.
 *
 * @example
 * listOpenPullRequestsForHead("feature/42-add-login");
 */
export function listOpenPullRequestsForHead(headBranch) {
  try {
    const raw = run(
      `gh pr list --head ${JSON.stringify(headBranch)} --state open --json number,url,title --limit 20`,
      { inherit: false },
    );
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((item) => ({
      number: Number(item.number),
      url: String(item.url),
      title: String(item.title || ""),
    }));
  } catch {
    return [];
  }
}

/**
 * Looks up a single open PR for the current head branch (first match).
 *
 * @param {string} headBranch - Full branch name (e.g. feature/42-x).
 * @returns {{ number: number, url: string, title?: string } | null} Open PR or null.
 *
 * @example
 * findOpenPullRequest("feature/42-add-login");
 */
export function findOpenPullRequest(headBranch) {
  const list = listOpenPullRequestsForHead(headBranch);
  return list[0] || null;
}

/**
 * Resolves which open PR to use for this head (pick / `--pr` / single).
 *
 * @param {string} headBranch - Full topic branch.
 * @param {string | number | undefined} prFlag - Explicit PR number.
 * @returns {Promise<{ ok: boolean, pr?: { number: number, url: string, title: string } | null }>} Outcome.
 *
 * @example
 * await resolveOpenPullRequest("feature/42-x");
 */
export async function resolveOpenPullRequest(headBranch, prFlag) {
  const open = listOpenPullRequestsForHead(headBranch);

  if (prFlag !== undefined && prFlag !== null && String(prFlag).trim() !== "") {
    const wanted = String(prFlag).replace(/^#/, "");
    if (!/^\d+$/.test(wanted)) {
      logError("Pass --pr <number>.");
      return { ok: false };
    }
    const match = open.find((item) => String(item.number) === wanted);
    if (!match) {
      logError(`Open PR #${wanted} not found for head ${headBranch}.`);
      return { ok: false };
    }
    logOk(`Using PR #${match.number}: ${match.url}`);
    return { ok: true, pr: match };
  }

  if (open.length === 0) {
    return { ok: true, pr: null };
  }
  if (open.length === 1) {
    logSkip(`Open PR already exists: ${open[0].url}`);
    return { ok: true, pr: open[0] };
  }

  if (!isInteractive()) {
    logError(`Multiple open PRs for ${headBranch}; pass --pr <number>.`);
    for (const item of open) {
      logInfo(`#${item.number} ${item.title} ${item.url}`);
    }
    return { ok: false };
  }

  logInfo("Open pull requests for this branch:");
  open.forEach((item, index) => {
    logInfo(`${index + 1}. #${item.number} ${item.title} (${item.url})`);
  });
  const answer = await askLine("Pick a PR by list number or #id", "");
  const asIndex = Number(answer);
  if (Number.isInteger(asIndex) && asIndex >= 1 && asIndex <= open.length) {
    const picked = open[asIndex - 1];
    logOk(`Using PR #${picked.number}`);
    return { ok: true, pr: picked };
  }
  const asId = answer.replace(/^#/, "");
  const byId = open.find((item) => String(item.number) === asId);
  if (byId) {
    logOk(`Using PR #${byId.number}`);
    return { ok: true, pr: byId };
  }
  logError("Invalid PR choice.");
  return { ok: false };
}

/**
 * Issue digits from branch name or `.git/CURRENT_ISSUE`.
 *
 * @param {string} shortName - Name without type prefix.
 * @returns {string | null} Digits, or null.
 *
 * @example
 * resolvePublishIssueNumber("42-add-login");
 */
export function resolvePublishIssueNumber(shortName) {
  return parseIssueNumberFromName(shortName) || readCurrentIssue();
}

/**
 * Seeds `.git/PR_EDITMSG` from the PR template with optional `Closes #N`.
 *
 * @param {string | null} issueNumber - Digits from the branch name.
 * @returns {{ ok: boolean, path?: string }} Outcome.
 *
 * @example
 * seedPullRequestDraft("42");
 */
export function seedPullRequestDraft(issueNumber) {
  return seedDraftFromTemplate(PR_EDITMSG, PR_TEMPLATE, (text) =>
    injectClosesIssue(text, issueNumber),
  );
}

/**
 * Resolves the PR body text from `--body-file` or an edited draft.
 *
 * @param {{ bodyFile?: string, issueNumber?: string | null }} options - Source options.
 * @returns {{ ok: boolean, body?: string, draftPath?: string }} Outcome.
 *
 * @example
 * resolvePullRequestBody({ issueNumber: "42" });
 * resolvePullRequestBody({ bodyFile: "./pr.md" });
 */
export function resolvePullRequestBody(options = {}) {
  if (options.bodyFile) {
    const abs = path.resolve(repoRoot, options.bodyFile);
    try {
      const body = readFileSync(abs, "utf8");
      return { ok: true, body, draftPath: abs };
    } catch (error) {
      logError(`Could not read --body-file: ${error instanceof Error ? error.message : error}`);
      return { ok: false };
    }
  }

  if (!isInteractive()) {
    logError("Non-interactive publish requires --body-file <path> with a filled Summary.");
    return { ok: false };
  }

  const seeded = seedPullRequestDraft(options.issueNumber ?? null);
  if (!seeded.ok || !seeded.path) {
    return { ok: false };
  }

  logInfo("Edit the pull request body in your editor, then save and close.");
  if (!openDraftInEditor(seeded.path).ok) {
    return { ok: false };
  }

  try {
    const body = readFileSync(seeded.path, "utf8");
    return { ok: true, body, draftPath: seeded.path };
  } catch (error) {
    logError(`Could not read PR draft: ${error instanceof Error ? error.message : error}`);
    return { ok: false };
  }
}

/**
 * Creates a pull request when none is open for the head branch.
 *
 * Opens `.git/PR_EDITMSG` (or reads `--body-file`), refuses an empty
 * Summary, then creates with `gh pr create --body-file`. Resets the
 * draft to the template after a successful create.
 *
 * @param {object} options - Create options.
 * @param {string} options.headBranch - Current topic branch.
 * @param {string} options.base - Target base branch.
 * @param {string | null} options.issueNumber - Optional issue digits.
 * @param {string} [options.bodyFile] - Non-interactive body path.
 * @param {string | number} [options.prNumber] - Explicit open PR when several exist.
 * @param {PublishableType | string} [options.gitFlowType] - Type for default PR labels.
 * @returns {{ ok: boolean, created?: boolean, url?: string }} Outcome.
 *
 * @example
 * await ensurePullRequest({ headBranch: "feature/42-x", base: "develop", issueNumber: "42", gitFlowType: "feature" });
 */
export async function ensurePullRequest(options) {
  const { headBranch, base, issueNumber, bodyFile, prNumber, gitFlowType } = options;

  if (!ghReady()) {
    logSkip("gh is not authenticated. Push succeeded; open a PR manually:");
    logInfo(`gh pr create --base ${base} --fill`);
    if (issueNumber) {
      logInfo(`Include in the body: Closes #${issueNumber}`);
    }
    return { ok: true, created: false };
  }

  const picked = await resolveOpenPullRequest(headBranch, prNumber);
  if (!picked.ok) {
    return { ok: false };
  }
  if (picked.pr) {
    return { ok: true, created: false, url: picked.pr.url };
  }

  const resolved = resolvePullRequestBody({ bodyFile, issueNumber });
  if (!resolved.ok || resolved.body === undefined) {
    return { ok: false };
  }

  if (!summaryIsFilled(resolved.body)) {
    logError("PR Summary is empty or only HTML comments — fill ## Summary before creating.");
    return { ok: false };
  }

  const shortName = headBranch.includes("/")
    ? headBranch.slice(headBranch.indexOf("/") + 1)
    : headBranch;
  const title = parseMarkdownTitle(resolved.body) || shortName;

  writeFileSync(PR_EDITMSG, resolved.body, "utf8");

  const labels = await resolveCreateLabels({
    gitFlowType: gitFlowType || "",
    promptExtras: true,
  });
  const createArgs = ["pr", "create", "--base", base, "--title", title, "--body-file", PR_EDITMSG];
  appendLabelArgs(createArgs, labels);
  if (labels.length > 0) {
    logInfo(`PR labels: ${labels.join(", ")}`);
  }

  logGo(`gh pr create --base ${base} --title … --body-file .git/PR_EDITMSG`);
  const result = spawnSync("gh", createArgs, {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if ((result.status ?? 1) !== 0) {
    logError("gh pr create failed");
    logInfo("Push succeeded; open or update the PR on GitHub.");
    return { ok: false };
  }

  resetFileToTemplate(PR_EDITMSG, PR_TEMPLATE);
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
 * @param {{ base?: string, nameArgs?: string[], allowNoChangeset?: boolean, bodyFile?: string, prNumber?: string }} [options] - Overrides.
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
  if (!isOnTypeBranch(type)) {
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
  const issueNumber = resolvePublishIssueNumber(shortName);

  const pr = await ensurePullRequest({
    headBranch: branch,
    base,
    issueNumber,
    bodyFile: options.bodyFile,
    prNumber: options.prNumber,
    gitFlowType: type,
  });
  if (!pr.ok) {
    return { ok: false };
  }

  logInfo("When ready, run the matching finish script to approve-gate, merge, and clean up.");
  logInfo(`Do not run: git flow ${type} finish`);
  return { ok: true };
}

/**
 * Parses `--base`, `--allow-no-changeset`, `--body-file`, and `--pr` from argv.
 *
 * @param {string[]} args - CLI args.
 * @returns {{ base?: string, allowNoChangeset: boolean, bodyFile?: string, prNumber?: string, rest: string[] }} Parsed pieces.
 *
 * @example
 * parseBaseArgs(["--base", "develop", "--allow-no-changeset", "42-x"]);
 * // { base: "develop", allowNoChangeset: true, rest: ["42-x"] }
 */
export function parseBaseArgs(args) {
  const rest = [];
  /** @type {string | undefined} */
  let base;
  /** @type {string | undefined} */
  let bodyFile;
  /** @type {string | undefined} */
  let prNumber;
  let allowNoChangeset = false;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--base") {
      base = args[i + 1];
      i += 1;
      continue;
    }
    if (args[i] === "--body-file") {
      bodyFile = args[i + 1];
      i += 1;
      continue;
    }
    if (args[i] === "--pr") {
      prNumber = args[i + 1];
      i += 1;
      continue;
    }
    if (args[i] === "--allow-no-changeset") {
      allowNoChangeset = true;
      continue;
    }
    rest.push(args[i]);
  }
  return { base, allowNoChangeset, bodyFile, prNumber, rest };
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
  const { base, allowNoChangeset, bodyFile, prNumber, rest } = parseBaseArgs(args.slice(1));
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (args.includes("--body-file") && !bodyFile) {
    logError("Pass --body-file <path>.");
    process.exit(1);
  }
  if (args.includes("--pr") && !prNumber) {
    logError("Pass --pr <number>.");
    process.exit(1);
  }
  const result = await publishWithPullRequest(type, {
    base,
    allowNoChangeset,
    bodyFile,
    prNumber,
    nameArgs: rest.length > 0 ? rest : undefined,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git-flow publish-flow");
}
