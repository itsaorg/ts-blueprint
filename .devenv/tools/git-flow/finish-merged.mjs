#!/usr/bin/env node

/** ==============================================================
 * ✅ Git Flow post-merge finish
 * ---------------------------------------------------------------
 * Shared finish for feature/bugfix/release/hotfix/support after
 * the GitHub pull request is reviewed and merged. Gates:
 *   1) PR for this head is MERGED
 *   2) Review was APPROVED
 *   3) Issue link when the branch name starts with `<number>-`
 *   4) release/hotfix only: no leftover pending changesets;
 *      package.json version matches the branch version
 * Then checks out the base branch and deletes the topic branch
 * locally and on origin. Never creates a PR. Never runs
 * `git flow <type> finish` (that merges locally and skips CI).
 *
 * HOW TO RUN:
 *   imported by git-flow type finish.mjs modules
 *   node .devenv/tools/git-flow/finish-merged.mjs feature
 *   node .devenv/tools/git-flow/finish-merged.mjs feature --allow-unapproved
 *   node .devenv/tools/git-flow/finish-merged.mjs support --base main
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Post-merge finish gates and local/remote branch cleanup.
 *
 * @module git-flow-finish-merged
 *
 * @example
 * import { finishAfterMerge } from "../finish-merged.mjs";
 * finishAfterMerge("feature");
 *
 * @example
 * // CLI:
 * //   node .devenv/tools/git-flow/finish-merged.mjs bugfix
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listPendingChangesetFiles } from "../../deps/changeset/pending.mjs";
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
import { currentBranch, stripTypePrefix } from "./command.mjs";
import { isGitFlowInstalled } from "./isInstalled.mjs";
import { defaultBaseFor, ghReady, parseIssueNumberFromName } from "./publish-flow.mjs";

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
      `gh pr list --head ${JSON.stringify(headBranch)} --state all --json number,state,mergedAt,reviewDecision,reviews,url,title,body,closingIssuesReferences --limit 20`,
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
      const raw = run(
        `gh pr view ${JSON.stringify(headBranch)} --json number,state,mergedAt,reviewDecision,reviews,url,title,body,closingIssuesReferences`,
        { inherit: false },
      );
      return JSON.parse(raw || "null");
    } catch {
      return null;
    }
  }
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

  logGo(`git push origin --delete ${branch}`);
  try {
    run(`git push origin --delete ${JSON.stringify(branch)}`);
    logOk(`Deleted remote branch ${branch}`);
  } catch {
    logInfo(`Remote branch ${branch} may already be deleted — continuing.`);
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
 * Runs all finish gates, then cleans up the topic branch.
 *
 * @param {FinishableType} type - Branch type.
 * @param {{ base?: string, allowUnapproved?: boolean }} [options] - Optional overrides.
 * @returns {Promise<{ ok: boolean }>} Outcome.
 *
 * @example
 * await finishAfterMerge("feature");
 * await finishAfterMerge("support", { base: "main", allowUnapproved: true });
 */
export async function finishAfterMerge(type, options = {}) {
  if (type !== "support" && !isGitFlowInstalled().ok) {
    return { ok: false };
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
  const base = options.base || defaultBaseFor(type);

  if (!assertReleaseVersionReady(type, shortName).ok) {
    return { ok: false };
  }

  if (!ghReady()) {
    logError("gh is not authenticated. Finish requires remote PR status checks.");
    logInfo("Run: gh auth login");
    return { ok: false };
  }

  const pr = viewPullRequestForHead(branch);
  if (!pr) {
    logError(`No pull request found for head branch ${branch}.`);
    logInfo("Publish first (opens the PR), wait for review + merge, then finish.");
    return { ok: false };
  }

  if (!isPullRequestMerged(pr)) {
    logError(`Pull request is not merged yet (${pr.url || "no url"}).`);
    logInfo(`State: ${pr.state || "unknown"}. Merge on GitHub, then re-run finish.`);
    return { ok: false };
  }
  logOk(`PR merged: ${pr.url || `#${pr.number}`}`);

  if (
    !(await requireApprovedReview(pr, { allowUnapproved: Boolean(options.allowUnapproved) })).ok
  ) {
    return { ok: false };
  }

  const issueNumber = parseIssueNumberFromName(shortName);
  if (issueNumber) {
    if (!isIssueLinkedOnPullRequest(pr, issueNumber)) {
      logError(`PR is not linked to issue #${issueNumber} from the branch name.`);
      logInfo("Add Closes #" + issueNumber + " (or Fixes/Resolves) on the PR, then retry.");
      return { ok: false };
    }
    logOk(`Issue link gate passed (#${issueNumber}).`);
  } else {
    logInfo("No leading issue number in branch name — skipping issue-link gate.");
  }

  logInfo(`Cleaning up after merge into ${base}…`);
  if (!cleanupTopicBranch(branch, base).ok) {
    return { ok: false };
  }

  logOk(`${type} finish complete.`);
  logInfo(`Do not run: git flow ${type} finish`);
  return { ok: true };
}

/**
 * Parses `--base <branch>` and `--allow-unapproved` from argv.
 *
 * @param {string[]} args - CLI args.
 * @returns {{ base?: string, allowUnapproved: boolean, rest: string[] }} Parsed pieces.
 *
 * @example
 * parseBaseArgs(["--base", "main", "--allow-unapproved"]);
 */
export function parseBaseArgs(args) {
  const rest = [];
  /** @type {string | undefined} */
  let base;
  let allowUnapproved = false;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--base") {
      base = args[i + 1];
      i += 1;
      continue;
    }
    if (args[i] === "--allow-unapproved") {
      allowUnapproved = true;
      continue;
    }
    rest.push(args[i]);
  }
  return { base, allowUnapproved, rest };
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
  const { base, allowUnapproved } = parseBaseArgs(args.slice(1));
  if (args.includes("--base") && !base) {
    logError("Pass --base <branch>.");
    process.exit(1);
  }
  const result = await finishAfterMerge(type, {
    ...(base ? { base } : {}),
    allowUnapproved,
  });
  if (!result.ok) {
    process.exit(1);
  }
  boxDone("git-flow finish-merged");
}
