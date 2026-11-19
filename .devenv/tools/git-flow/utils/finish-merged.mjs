#!/usr/bin/env node

/** ==============================================================
 * ✅ Git Flow finish (approve / CI / merge / cleanup)
 * ---------------------------------------------------------------
 * Shared finish for feature/bugfix/release/hotfix/support.
 * Never creates a PR (publish owns that). Gates:
 *   1) Clean working tree; topic branch published on origin
 *   2) Resolve PR for this head (pick / `--pr`); else refuse → publish
 *   3) If open: CI green, approving review, issue link, then merge
 *      (default: merge commit / full history; TTY or `--squash` / `--merge`)
 *   4) If already merged: approval + issue-link gates still apply
 *   5) release/hotfix version gates; close linked issue if still open
 *      (any base, including develop); delete topic branch and **verify**
 *      remote is gone (fail finish if not); clear CURRENT_ISSUE
 * Never runs `git flow <type> finish` (local merge skips CI).
 *
 * HOW TO RUN:
 *   imported by git-flow type finish.mjs modules
 *   node .devenv/tools/git-flow/utils/finish-merged.mjs feature
 *   node .devenv/tools/git-flow/utils/finish-merged.mjs feature --allow-unapproved
 *   node .devenv/tools/git-flow/utils/finish-merged.mjs feature --pr 25 --merge
 *   node .devenv/tools/git-flow/utils/finish-merged.mjs support --base main --squash
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Finish gates: approve, CI, merge, and local/remote branch cleanup.
 *
 * @module git-flow-finish-merged
 *
 * @example
 * import { finishAfterMerge } from "../finish-merged.mjs";
 * await finishAfterMerge("feature");
 *
 * @example
 * // CLI:
 * //   node .devenv/tools/git-flow/utils/finish-merged.mjs bugfix
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listPendingChangesetFiles } from "../../../deps/changeset/pending.mjs";
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
import { currentBranch, stripTypePrefix } from "./command.mjs";
import { closeIssueIfOpen, deleteRemoteBranchVerified } from "./dev-links.mjs";
import { isOnTypeBranch } from "./gates/isOnTypeBranch.mjs";
import { remoteBranchExists } from "./gates/remoteBranchExists.mjs";
import { isGitFlowInstalled } from "../isInstalled.mjs";
import {
  askLine,
  defaultBaseFor,
  ghReady,
  listOpenPullRequestsForHead,
  parseIssueNumberFromName,
  resolveOpenPullRequest,
} from "./publish-flow.mjs";
import {
  clearCurrentIssue,
  mergeStrategyFor,
  readCurrentIssue,
  requireCleanWorkingTree,
} from "./start-gates.mjs";

export { remoteBranchExists } from "./gates/remoteBranchExists.mjs";

/**
 * @typedef {"feature" | "bugfix" | "release" | "hotfix" | "support"} FinishableType
 */

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

const PR_JSON_FIELDS =
  "number,state,mergedAt,reviewDecision,reviews,url,title,body,statusCheckRollup";

/**
 * Fetches full PR metadata by number.
 *
 * @param {string | number} number - PR number.
 * @returns {object | null} Parsed JSON, or null.
 *
 * @example
 * viewPullRequestByNumber(25);
 */
export function viewPullRequestByNumber(number) {
  try {
    const raw = run(`gh pr view ${JSON.stringify(String(number))} --json ${PR_JSON_FIELDS}`, {
      inherit: false,
    });
    return JSON.parse(raw || "null");
  } catch {
    return null;
  }
}

/**
 * Fetches PR metadata for the current head branch (any state).
 *
 * Prefers a merged PR when several exist historically.
 *
 * @param {string} headBranch - Full branch name.
 * @returns {object | null} Parsed `gh pr view` JSON, or null.
 *
 * @example
 * const pr = viewPullRequestForHead("feature/42-add-login");
 */
export function viewPullRequestForHead(headBranch) {
  try {
    const raw = run(
      `gh pr list --head ${JSON.stringify(headBranch)} --state all --json ${PR_JSON_FIELDS} --limit 20`,
      { inherit: false },
    );
    const list = JSON.parse(raw || "[]");
    if (!Array.isArray(list) || list.length === 0) {
      return null;
    }
    const merged = list.find((item) => item.state === "MERGED" || item.mergedAt);
    return merged || list[0];
  } catch {
    try {
      const raw = run(`gh pr view ${JSON.stringify(headBranch)} --json ${PR_JSON_FIELDS}`, {
        inherit: false,
      });
      return JSON.parse(raw || "null");
    } catch {
      return null;
    }
  }
}

/**
 * Whether CI / status checks on the PR are successful.
 *
 * @param {object} pr - PR JSON (may include statusCheckRollup).
 * @returns {boolean} True when all completed checks succeeded (or none reported).
 *
 * @example
 * isPullRequestCiGreen({ statusCheckRollup: [{ status: "COMPLETED", conclusion: "SUCCESS" }] });
 */
export function isPullRequestCiGreen(pr) {
  const rollup = Array.isArray(pr?.statusCheckRollup) ? pr.statusCheckRollup : [];
  if (rollup.length === 0) {
    return true;
  }
  return rollup.every((check) => {
    const status = String(check.status || "");
    if (status && status !== "COMPLETED") {
      return false;
    }
    const conclusion = String(check.conclusion || "");
    return conclusion === "SUCCESS" || conclusion === "NEUTRAL" || conclusion === "SKIPPED";
  });
}

/**
 * Requires CI green on the PR.
 *
 * @param {object} pr - PR JSON.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * requireCiGreen(pr);
 */
export function requireCiGreen(pr) {
  if (isPullRequestCiGreen(pr)) {
    logOk("CI / status checks passed.");
    return { ok: true };
  }
  logError(`CI is not green yet (${pr.url || `#${pr.number}`}).`);
  logInfo("Wait for checks, then re-run finish.");
  return { ok: false };
}

/**
 * Resolves merge vs squash: explicit flag, else TTY prompt (default merge), else type default.
 *
 * @param {{ type?: FinishableType, mergeStrategy?: "merge" | "squash" }} [options] - Overrides.
 * @returns {Promise<"merge" | "squash">} Chosen strategy.
 *
 * @example
 * await resolveMergeStrategy({ mergeStrategy: "squash" }); // "squash"
 * await resolveMergeStrategy({ type: "feature" }); // "merge" (non-TTY / default)
 */
export async function resolveMergeStrategy(options = {}) {
  if (options.mergeStrategy === "merge" || options.mergeStrategy === "squash") {
    return options.mergeStrategy;
  }
  if (isInteractive()) {
    logInfo("Merge strategy:");
    logInfo("1. merge — full commit history (default)");
    logInfo("2. squash — single commit on the base");
    const picked = (await askLine("Merge strategy number", "1")).toLowerCase();
    if (picked === "2" || picked === "squash") {
      return "squash";
    }
    return "merge";
  }
  return mergeStrategyFor(options.type);
}

/**
 * Merges a PR with the resolved strategy (default: merge commit).
 *
 * @param {string | number} number - PR number.
 * @param {FinishableType} type - Branch type.
 * @param {{ mergeStrategy?: "merge" | "squash" }} [options] - Optional strategy override.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await mergePullRequest(25, "feature");
 * await mergePullRequest(25, "feature", { mergeStrategy: "squash" });
 */
export async function mergePullRequest(number, type, options = {}) {
  const strategy = await resolveMergeStrategy({
    type,
    mergeStrategy: options.mergeStrategy,
  });
  const flag = strategy === "squash" ? "--squash" : "--merge";
  logGo(`gh pr merge ${number} ${flag} --delete-branch=false`);
  const result = spawnSync("gh", ["pr", "merge", String(number), flag, "--delete-branch=false"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if ((result.status ?? 1) !== 0) {
    logError(`gh pr merge #${number} failed`);
    return { ok: false };
  }
  logOk(`Merged PR #${number} (${strategy}).`);
  return { ok: true };
}

/**
 * Whether the PR counts as merged on the remote.
 *
 * @param {object} pr - PR JSON from gh.
 * @returns {boolean} True when merged.
 *
 * @example
 * isPullRequestMerged({ state: "MERGED", mergedAt: "2026-01-01" }); // true
 */
export function isPullRequestMerged(pr) {
  if (!pr) {
    return false;
  }
  if (pr.state === "MERGED") {
    return true;
  }
  return Boolean(pr.mergedAt);
}

/**
 * Whether the PR has an approving review decision.
 *
 * Accepts `reviewDecision === "APPROVED"` or any review with
 * `state === "APPROVED"`.
 *
 * @param {object} pr - PR JSON from gh.
 * @returns {boolean} True when review gate passes.
 *
 * @example
 * isPullRequestApproved({ reviewDecision: "APPROVED" }); // true
 */
export function isPullRequestApproved(pr) {
  if (!pr) {
    return false;
  }
  if (pr.reviewDecision === "APPROVED") {
    return true;
  }
  const reviews = Array.isArray(pr.reviews) ? pr.reviews : [];
  return reviews.some((review) => review && review.state === "APPROVED");
}

/**
 * Whether the PR body/title/closing refs link the expected issue.
 *
 * @param {object} pr - PR JSON from gh.
 * @param {string} issueNumber - Digits expected (e.g. "42").
 * @returns {boolean} True when linked.
 *
 * @example
 * isIssueLinkedOnPullRequest({ body: "Closes #42" }, "42"); // true
 */
export function isIssueLinkedOnPullRequest(pr, issueNumber) {
  if (!pr || !issueNumber) {
    return false;
  }
  const refs = Array.isArray(pr.closingIssuesReferences) ? pr.closingIssuesReferences : [];
  if (refs.some((ref) => String(ref.number) === String(issueNumber))) {
    return true;
  }
  const blob = `${pr.title || ""}\n${pr.body || ""}`;
  const re = new RegExp(`(?:Fixes|Closes|Resolves)\\s+#${issueNumber}\\b`, "i");
  return re.test(blob);
}

/**
 * release/hotfix: pending changesets must already be consumed and
 * package.json version must match the branch version segment.
 *
 * @param {FinishableType} type - Branch type.
 * @param {string} shortName - Name without type prefix.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * assertReleaseVersionReady("release", "1.2.0");
 */
export function assertReleaseVersionReady(type, shortName) {
  if (type !== "release" && type !== "hotfix") {
    return { ok: true };
  }

  const pending = listPendingChangesetFiles();
  if (pending.length > 0) {
    logError(`Pending changeset files still exist on this ${type} branch.`);
    logInfo("Run npm run changeset:version first, commit the result, then re-publish/merge.");
    for (const file of pending) {
      logInfo(path.relative(repoRoot, file));
    }
    return { ok: false };
  }

  const pkgVersion = readPackageVersion();
  if (!pkgVersion) {
    logError("Could not read package.json version.");
    return { ok: false };
  }
  if (pkgVersion !== shortName) {
    logError(
      `package.json version "${pkgVersion}" does not match ${type} branch version "${shortName}".`,
    );
    logInfo("On release/hotfix, run changeset:version so the version matches the branch name.");
    return { ok: false };
  }
  logOk(`Version gate passed (${pkgVersion}).`);
  return { ok: true };
}

/**
 * Deletes the topic branch locally and on origin, then checks out base.
 *
 * Remote delete goes through the GitHub API (husky pre-push cannot
 * block it) and **must** verify the ref is gone — finish fails if not.
 *
 * @param {string} branch - Full topic branch name.
 * @param {string} base - Base branch to check out.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * cleanupTopicBranch("feature/42-x", "develop");
 */
export function cleanupTopicBranch(branch, base) {
  logGo(`git checkout ${base}`);
  try {
    run(`git checkout ${base}`);
  } catch {
    logError(`Failed to checkout ${base}. Fetch/pull the base branch, then retry.`);
    return { ok: false };
  }

  logGo(`git branch -D ${branch}`);
  try {
    run(`git branch -D ${JSON.stringify(branch)}`);
    logOk(`Deleted local branch ${branch}`);
  } catch {
    logError(`Failed to delete local branch ${branch}`);
    return { ok: false };
  }

  if (!deleteRemoteBranchVerified(branch).ok) {
    return { ok: false };
  }

  try {
    run(`git pull origin ${base}`);
  } catch {
    logInfo(`Could not pull ${base}; update it manually when convenient.`);
  }

  return { ok: true };
}

/**
 * Enforces the approving-review gate (policy C).
 *
 * Bypass: `--allow-unapproved` **or** interactive TTY confirm (default no).
 * Non-TTY without the flag refuses.
 *
 * @param {object} pr - PR JSON from gh.
 * @param {{ allowUnapproved?: boolean }} [options] - Bypass options.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await requireApprovedReview(pr, { allowUnapproved: true });
 */
export async function requireApprovedReview(pr, options = {}) {
  if (isPullRequestApproved(pr)) {
    logOk("PR review gate passed (APPROVED).");
    return { ok: true };
  }

  logError("Pull request has no approving review.");
  logInfo("Solo maintainers: pass --allow-unapproved or confirm interactively.");

  if (options.allowUnapproved) {
    logSkip("Bypassing review gate (--allow-unapproved).");
    return { ok: true };
  }
  if (isInteractive()) {
    const yes = await askYesNo("Finish without an APPROVED review?", false);
    if (yes) {
      logSkip("Bypassing review gate (interactive confirm).");
      return { ok: true };
    }
  } else {
    logInfo("Non-interactive shell: re-run with --allow-unapproved to bypass.");
  }
  return { ok: false };
}

/**
 * Runs finish SOPs: publish check, PR resolve, CI, approve, merge, cleanup.
 *
 * @param {FinishableType} type - Branch type.
 * @param {{ base?: string, allowUnapproved?: boolean, prNumber?: string, mergeStrategy?: "merge" | "squash" }} [options] - Optional overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await finishAfterMerge("feature");
 * await finishAfterMerge("support", { base: "main", allowUnapproved: true, mergeStrategy: "merge" });
 */
export async function finishAfterMerge(type, options = {}) {
  if (type !== "support" && !isGitFlowInstalled().ok) {
    return { ok: false };
  }

  if (!requireCleanWorkingTree().ok) {
    return { ok: false };
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
  const base = options.base || defaultBaseFor(type);

  if (!assertReleaseVersionReady(type, shortName).ok) {
    return { ok: false };
  }

  if (!ghReady()) {
    logError("gh is not authenticated. Finish requires remote PR status checks.");
    logInfo("Run: gh auth login");
    return { ok: false };
  }

  if (!remoteBranchExists(branch)) {
    logError(`Branch ${branch} is not published on origin.`);
    logInfo(`Run: npm run gf:${type}:publish`);
    return { ok: false };
  }
  logOk(`Remote branch origin/${branch} exists.`);

  const open = listOpenPullRequestsForHead(branch);
  let pr = null;

  if (options.prNumber) {
    pr = viewPullRequestByNumber(options.prNumber);
    if (!pr) {
      logError(`PR #${options.prNumber} not found.`);
      return { ok: false };
    }
  } else if (open.length > 0) {
    const picked = await resolveOpenPullRequest(branch, undefined);
    if (!picked.ok) {
      return { ok: false };
    }
    if (picked.pr) {
      pr = viewPullRequestByNumber(picked.pr.number);
    }
  } else {
    pr = viewPullRequestForHead(branch);
  }

  if (!pr) {
    logError(`No pull request found for head branch ${branch}.`);
    logInfo(`Publish first: npm run gf:${type}:publish`);
    if (isInteractive()) {
      const yes = await askYesNo(
        "Run publish now? (finish will still need a later merge run)",
        false,
      );
      if (yes) {
        logInfo(`Run manually: npm run gf:${type}:publish`);
      }
    }
    return { ok: false };
  }

  const issueNumber = parseIssueNumberFromName(shortName) || readCurrentIssue();

  if (!isPullRequestMerged(pr)) {
    if (!requireCiGreen(pr).ok) {
      return { ok: false };
    }
    if (
      !(await requireApprovedReview(pr, { allowUnapproved: Boolean(options.allowUnapproved) })).ok
    ) {
      return { ok: false };
    }
    if (issueNumber) {
      if (!isIssueLinkedOnPullRequest(pr, issueNumber)) {
        logError(`PR is not linked to issue #${issueNumber}.`);
        logInfo("Add Closes #" + issueNumber + " (or Fixes/Resolves) on the PR, then retry.");
        return { ok: false };
      }
      logOk(`Issue link gate passed (#${issueNumber}).`);
    } else {
      logInfo("No issue number on branch or CURRENT_ISSUE — skipping issue-link gate.");
    }

    if (
      !(
        await mergePullRequest(pr.number, type, {
          mergeStrategy: options.mergeStrategy,
        })
      ).ok
    ) {
      return { ok: false };
    }
    pr = viewPullRequestByNumber(pr.number) || pr;
  } else {
    logOk(`PR already merged: ${pr.url || `#${pr.number}`}`);
    if (
      !(await requireApprovedReview(pr, { allowUnapproved: Boolean(options.allowUnapproved) })).ok
    ) {
      return { ok: false };
    }
    if (issueNumber) {
      if (!isIssueLinkedOnPullRequest(pr, issueNumber)) {
        logError(`PR is not linked to issue #${issueNumber}.`);
        logInfo("Add Closes #" + issueNumber + " (or Fixes/Resolves) on the PR, then retry.");
        return { ok: false };
      }
      logOk(`Issue link gate passed (#${issueNumber}).`);
    } else {
      logInfo("No issue number on branch or CURRENT_ISSUE — skipping issue-link gate.");
    }
  }

  if (!isPullRequestMerged(pr)) {
    logError("PR is still not merged after merge attempt.");
    return { ok: false };
  }

  if (issueNumber) {
    if (
      !closeIssueIfOpen(issueNumber, {
        prNumber: pr.number,
        base,
      }).ok
    ) {
      return { ok: false };
    }
  }

  logInfo(`Cleaning up after merge into ${base}…`);
  if (!cleanupTopicBranch(branch, base).ok) {
    return { ok: false };
  }
  clearCurrentIssue();

  logOk(`${type} finish complete.`);
  logInfo(`Do not run: git flow ${type} finish`);
  return { ok: true };
}

/**
 * Parses `--base`, `--allow-unapproved`, `--pr`, `--merge`, and `--squash` from argv.
 *
 * @param {string[]} args - CLI args.
 * @returns {{ base?: string, allowUnapproved: boolean, prNumber?: string, mergeStrategy?: "merge" | "squash", rest: string[] }} Parsed pieces.
 *
 * @example
 * parseBaseArgs(["--base", "main", "--allow-unapproved", "--merge"]);
 */
export function parseBaseArgs(args) {
  const rest = [];
  /** @type {string | undefined} */
  let base;
  /** @type {string | undefined} */
  let prNumber;
  /** @type {"merge" | "squash" | undefined} */
  let mergeStrategy;
  let allowUnapproved = false;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--base") {
      base = args[i + 1];
      i += 1;
      continue;
    }
    if (args[i] === "--pr") {
      prNumber = args[i + 1];
      i += 1;
      continue;
    }
    if (args[i] === "--allow-unapproved") {
      allowUnapproved = true;
      continue;
    }
    if (args[i] === "--merge") {
      mergeStrategy = "merge";
      continue;
    }
    if (args[i] === "--squash") {
      mergeStrategy = "squash";
      continue;
    }
    rest.push(args[i]);
  }
  return { base, allowUnapproved, prNumber, mergeStrategy, rest };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("✅ git-flow finish-merged");
  const args = forwardedArgs();
  const type = /** @type {FinishableType | undefined} */ (args[0]);
  const allowed = new Set(["feature", "bugfix", "release", "hotfix", "support"]);
  if (!type || !allowed.has(type)) {
    logError("Pass a type: feature | bugfix | release | hotfix | support");
    process.exit(1);
  }
  const { base, allowUnapproved, prNumber, mergeStrategy } = parseBaseArgs(args.slice(1));
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  if (args.includes("--pr") && !prNumber) {
    logError("Pass --pr <number>.");
    process.exit(1);
  }
  if (args.includes("--merge") && args.includes("--squash")) {
    logError("Pass only one of --merge or --squash.");
    process.exit(1);
  }
  const result = await finishAfterMerge(type, {
    ...(base ? { base } : {}),
    allowUnapproved,
    prNumber,
    ...(mergeStrategy ? { mergeStrategy } : {}),
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git-flow finish-merged");
}
