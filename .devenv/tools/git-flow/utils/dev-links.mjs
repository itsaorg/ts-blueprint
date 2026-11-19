#!/usr/bin/env node

/** ==============================================================
 * 🔗 Development sidebar links (issue ↔ branch / PR)
 * ---------------------------------------------------------------
 * GitHub only auto-closes via `Closes #N` when the PR base is the
 * default branch. Feature/bugfix PRs into `develop` need an
 * explicit Development link (`addCloseIssueReferences`) and finish
 * must close the issue itself. On start, `createLinkedBranch` adds
 * the topic branch under the issue Development sidebar.
 *
 * Soft-fails on API rejection (permissions / preview) so publish
 * and start still succeed; callers log and continue.
 *
 * HOW TO RUN:
 *   imported by publish-flow, feature/bugfix start, finish-merged
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * GraphQL helpers for issue Development links and explicit close.
 *
 * @module git-flow-dev-links
 *
 * @example
 * import { linkIssueToPullRequest, linkIssueToBranch } from "./dev-links.mjs";
 * linkIssueToPullRequest("39", "40");
 * linkIssueToBranch("39", "feature/39-x");
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logGo,
  logInfo,
  logOk,
  logSkip,
  repoRoot,
  run,
} from "../../../lib/tool-lib.mjs";

/**
 * Escapes a string for embedding in a GraphQL document literal.
 *
 * @param {string} value - Raw value.
 * @returns {string} Escaped content (no surrounding quotes).
 */
function escapeGraphqlString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Runs a GraphQL mutation/query via `gh api graphql`.
 *
 * Prefer a fully inlined document when list variables are needed —
 * `gh -F` does not reliably encode `[ID!]!` arrays.
 *
 * @param {string} query - GraphQL document.
 * @param {Record<string, string>} [variables] - Scalar variable map (`-F key=value`).
 * @returns {{ ok: boolean, data?: object, errors?: unknown }} Parsed result.
 */
export function ghGraphql(query, variables = {}) {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [key, value] of Object.entries(variables)) {
    args.push("-F", `${key}=${value}`);
  }
  const result = spawnSync("gh", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const stdout = String(result.stdout ?? "").trim();
  const stderr = String(result.stderr ?? "").trim();
  if ((result.status ?? 1) !== 0) {
    return { ok: false, errors: stderr || stdout || `exit ${result.status}` };
  }
  try {
    const parsed = JSON.parse(stdout || "{}");
    if (parsed.errors) {
      return { ok: false, data: parsed.data, errors: parsed.errors };
    }
    return { ok: true, data: parsed.data };
  } catch (error) {
    return {
      ok: false,
      errors: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Resolves the GraphQL node id for an issue number.
 *
 * @param {string | number} issueNumber - Issue digits.
 * @returns {string | null} Node id, or null.
 */
export function resolveIssueNodeId(issueNumber) {
  try {
    const raw = run(`gh issue view ${JSON.stringify(String(issueNumber))} --json id -q .id`, {
      inherit: false,
    });
    const id = String(raw || "").trim();
    return id || null;
  } catch {
    return null;
  }
}

/**
 * Resolves the GraphQL node id for a pull request number.
 *
 * @param {string | number} prNumber - PR digits.
 * @returns {string | null} Node id, or null.
 */
export function resolvePullRequestNodeId(prNumber) {
  try {
    const raw = run(`gh pr view ${JSON.stringify(String(prNumber))} --json id -q .id`, {
      inherit: false,
    });
    const id = String(raw || "").trim();
    return id || null;
  } catch {
    return null;
  }
}

/**
 * Parses a PR number from `gh pr create` stdout or from an open-PR URL.
 *
 * @param {string} text - URL or create output.
 * @returns {string | null} Digits, or null.
 */
export function parsePullRequestNumberFromText(text) {
  const match = String(text ?? "").match(/\/pull\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Looks up the open PR number for a head branch.
 *
 * @param {string} headBranch - Full topic branch.
 * @returns {string | null} PR number digits, or null.
 */
export function findOpenPullRequestNumber(headBranch) {
  try {
    const raw = run(
      `gh pr list --head ${JSON.stringify(headBranch)} --state open --json number --limit 1 -q ".[0].number"`,
      { inherit: false },
    );
    const number = String(raw || "").trim();
    return /^\d+$/.test(number) ? number : null;
  } catch {
    return null;
  }
}

/**
 * Links a PR into the issue Development sidebar via addCloseIssueReferences.
 *
 * Soft-fails: logs and returns `{ ok: false }` without throwing.
 *
 * @param {string | number} issueNumber - Issue digits.
 * @param {string | number} prNumber - PR digits.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * linkIssueToPullRequest("39", "40");
 */
export function linkIssueToPullRequest(issueNumber, prNumber) {
  if (!issueNumber || !prNumber) {
    return { ok: false };
  }
  const issueId = resolveIssueNodeId(issueNumber);
  const pullRequestId = resolvePullRequestNodeId(prNumber);
  if (!issueId || !pullRequestId) {
    logSkip(
      `Could not resolve GraphQL ids for issue #${issueNumber} / PR #${prNumber}; Development link skipped.`,
    );
    return { ok: false };
  }

  logGo(`GraphQL addCloseIssueReferences (issue #${issueNumber} ← PR #${prNumber})`);
  const result = ghGraphql(
    `mutation {
      addCloseIssueReferences(input: {
        issueId: "${escapeGraphqlString(issueId)}"
        pullRequestIds: ["${escapeGraphqlString(pullRequestId)}"]
      }) {
        clientMutationId
      }
    }`,
  );
  if (!result.ok) {
    logSkip(
      `addCloseIssueReferences failed (issue #${issueNumber} / PR #${prNumber}); finish will still close the issue.`,
    );
    if (result.errors) {
      logInfo(typeof result.errors === "string" ? result.errors : JSON.stringify(result.errors));
    }
    return { ok: false };
  }
  logOk(`Linked PR #${prNumber} to issue #${issueNumber} (Development).`);
  return { ok: true };
}

/**
 * Links the topic branch under the issue Development sidebar.
 *
 * Soft-fails on API rejection. Prefer after `git flow … start` when the
 * branch exists locally; uses HEAD oid. When the branch is not yet on
 * origin, createLinkedBranch still accepts the local oid + name.
 *
 * @param {string | number} issueNumber - Issue digits.
 * @param {string} branchName - Full branch (e.g. feature/39-x).
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * linkIssueToBranch("39", "feature/39-x");
 */
export function linkIssueToBranch(issueNumber, branchName) {
  if (!issueNumber || !branchName) {
    return { ok: false };
  }

  // After git-flow start the branch already exists — use createLinkedBranch.
  // Do not call `gh issue develop` here; that creates a second remote branch.
  const issueId = resolveIssueNodeId(issueNumber);
  /** @type {string} */
  let oid;
  try {
    oid = run(`git rev-parse ${JSON.stringify(branchName)}`, { inherit: false }).trim();
  } catch {
    try {
      oid = run("git rev-parse HEAD", { inherit: false }).trim();
    } catch {
      oid = "";
    }
  }
  if (!issueId || !oid) {
    logSkip(
      `Could not resolve issue id / oid for #${issueNumber} → ${branchName}; Development branch link skipped.`,
    );
    return { ok: false };
  }

  logGo(`GraphQL createLinkedBranch (issue #${issueNumber} ← ${branchName})`);
  const result = ghGraphql(
    `mutation {
      createLinkedBranch(input: {
        issueId: "${escapeGraphqlString(issueId)}"
        oid: "${escapeGraphqlString(oid)}"
        name: "${escapeGraphqlString(branchName)}"
      }) {
        linkedBranch { id }
      }
    }`,
  );
  if (!result.ok) {
    logSkip(
      `createLinkedBranch failed for #${issueNumber} / ${branchName}; continuing without Development branch link.`,
    );
    if (result.errors) {
      logInfo(typeof result.errors === "string" ? result.errors : JSON.stringify(result.errors));
    }
    return { ok: false };
  }
  logOk(`Linked branch ${branchName} to issue #${issueNumber} (Development).`);
  return { ok: true };
}

/**
 * Closes an issue when it is still OPEN (any PR base, including develop).
 *
 * @param {string | number} issueNumber - Issue digits.
 * @param {{ prNumber?: string | number, base?: string }} [options] - Context for the comment.
 * @returns {{ ok: boolean, closed?: boolean, skipped?: boolean }} Outcome.
 *
 * @example
 * closeIssueIfOpen("39", { prNumber: 40, base: "develop" });
 */
export function closeIssueIfOpen(issueNumber, options = {}) {
  if (!issueNumber) {
    return { ok: true, skipped: true };
  }
  /** @type {string} */
  let state;
  try {
    state = run(`gh issue view ${JSON.stringify(String(issueNumber))} --json state -q .state`, {
      inherit: false,
    }).trim();
  } catch {
    logError(`Could not read issue #${issueNumber} state.`);
    return { ok: false };
  }
  if (state !== "OPEN") {
    logSkip(`Issue #${issueNumber} is already ${state || "closed"}.`);
    return { ok: true, skipped: true, closed: false };
  }

  const prBit = options.prNumber ? ` via PR #${options.prNumber}` : "";
  const baseBit = options.base ? ` into ${options.base}` : "";
  const comment = `Closed by finish${prBit}${baseBit}. GitHub only auto-closes on the default branch; scripts close explicitly for develop merges.`;
  logGo(`gh issue close ${issueNumber}`);
  const result = spawnSync(
    "gh",
    ["issue", "close", String(issueNumber), "--reason", "completed", "--comment", comment],
    {
      cwd: repoRoot,
      stdio: "inherit",
    },
  );
  if ((result.status ?? 1) !== 0) {
    logError(`Failed to close issue #${issueNumber}.`);
    return { ok: false };
  }
  logOk(`Closed issue #${issueNumber}.`);
  return { ok: true, closed: true };
}

/**
 * Whether origin still has the given head ref (no fetch required).
 *
 * @param {string} branch - Full branch name.
 * @returns {boolean} True when the remote head exists.
 */
export function remoteHeadStillExists(branch) {
  try {
    const raw = run(`git ls-remote --heads origin ${JSON.stringify(branch)}`, {
      inherit: false,
    });
    return Boolean(String(raw || "").trim());
  } catch {
    try {
      const nameWithOwner = run(`gh repo view --json nameWithOwner -q .nameWithOwner`, {
        inherit: false,
      }).trim();
      if (!nameWithOwner) {
        return false;
      }
      const refPath = `repos/${nameWithOwner}/git/refs/heads/${encodeURIComponent(branch)}`;
      const probe = spawnSync("gh", ["api", refPath], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      return (probe.status ?? 1) === 0;
    } catch {
      return false;
    }
  }
}

/**
 * Deletes the remote topic branch via GitHub API and verifies it is gone.
 *
 * Retries delete once if the ref still exists. Fails finish when still present.
 *
 * @param {string} branch - Full topic branch name.
 * @returns {{ ok: boolean }} Outcome.
 *
 * @example
 * deleteRemoteBranchVerified("feature/39-x");
 */
export function deleteRemoteBranchVerified(branch) {
  const nameWithOwner = (() => {
    try {
      return run(`gh repo view --json nameWithOwner -q .nameWithOwner`, {
        inherit: false,
      }).trim();
    } catch {
      return "";
    }
  })();
  if (!nameWithOwner) {
    logError("Could not resolve repository nameWithOwner for remote delete.");
    return { ok: false };
  }

  const refPath = `repos/${nameWithOwner}/git/refs/heads/${encodeURIComponent(branch)}`;

  const attemptDelete = () => {
    logGo(`gh api DELETE refs/heads/${branch}`);
    const deleted = spawnSync("gh", ["api", "-X", "DELETE", refPath], {
      cwd: repoRoot,
      stdio: "inherit",
    });
    return (deleted.status ?? 1) === 0;
  };

  if (!remoteHeadStillExists(branch)) {
    logOk(`Remote branch ${branch} already gone.`);
    return { ok: true };
  }

  if (!attemptDelete()) {
    logError(`gh api DELETE failed for ${branch}`);
  }

  if (!remoteHeadStillExists(branch)) {
    logOk(`Deleted remote branch ${branch}`);
    return { ok: true };
  }

  logInfo(`Remote ${branch} still present — retrying delete once.`);
  attemptDelete();

  if (!remoteHeadStillExists(branch)) {
    logOk(`Deleted remote branch ${branch} (retry).`);
    return { ok: true };
  }

  logError(`Remote branch ${branch} still exists after delete attempts.`);
  logInfo("Finish refuses to continue until the remote topic branch is gone.");
  return { ok: false };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🔗 git-flow dev-links");
  const [action, a, b] = forwardedArgs();
  if (action === "pr" && a && b) {
    if (!linkIssueToPullRequest(a, b).ok) {
      process.exit(1);
    }
  } else if (action === "branch" && a && b) {
    if (!linkIssueToBranch(a, b).ok) {
      process.exit(1);
    }
  } else if (action === "close" && a) {
    if (!closeIssueIfOpen(a, { prNumber: b }).ok) {
      process.exit(1);
    }
  } else {
    logError("Usage: dev-links.mjs pr <issue> <pr> | branch <issue> <branch> | close <issue> [pr]");
    process.exit(1);
  }
  boxDone("git-flow dev-links");
}
