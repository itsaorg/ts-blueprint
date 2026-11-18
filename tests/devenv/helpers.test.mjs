/** ==============================================================
 * 🧪 Devenv helper unit tests
 * ---------------------------------------------------------------
 * Hermetic tests for pure helpers used by label sync, changesets,
 * and git-flow publish/finish (no live `gh` or network). Written
 * as `.mjs` so ESLint skips TypeScript type-aware rules on untyped
 * `.devenv` imports.
 *
 * HOW TO RUN:
 *   npm run vitest:run
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

import { describe, expect, it } from "vitest";
import { isPendingChangesetFile } from "../../.devenv/deps/changeset/pending.mjs";
import { labelFieldsMatch, normalizeLabelColor } from "../../.devenv/tools/gh/label/sync.mjs";
import {
  injectClosesIssue,
  parseIssueDraft,
  parseMarkdownTitle,
  summaryIsFilled,
} from "../../.devenv/tools/git-flow/utils/edit-draft.mjs";
import {
  issueFormChoiceForGitFlowType,
  parseIssueFormYaml,
  parseIssueSlug,
  seedIssueDraftFromFormMeta,
  slugifyIssueTitle,
} from "../../.devenv/tools/git-flow/utils/issue-gate.mjs";
import {
  hasAllowNoChangesetFlag,
  parseBaseArgs as parsePublishArgs,
  parseIssueNumberFromName,
  resolvePublishIssueNumber,
} from "../../.devenv/tools/git-flow/utils/publish-flow.mjs";
import {
  isPullRequestCiGreen,
  parseBaseArgs as parseFinishArgs,
} from "../../.devenv/tools/git-flow/utils/finish-merged.mjs";
import {
  mergeStrategyFor,
  parseAheadBehind,
  parseIssueFlagArgs,
} from "../../.devenv/tools/git-flow/utils/start-gates.mjs";
import { branchMatchesType } from "../../.devenv/tools/git-flow/utils/gates/branchMatchesType.mjs";
import { parseAheadBehind as parseGateAheadBehind } from "../../.devenv/tools/git-flow/utils/gates/parseAheadBehind.mjs";
import {
  defaultLabelsForGitFlowType,
  mergeLabelLists,
} from "../../.devenv/tools/git-flow/utils/labels.mjs";
import {
  isChangesetAddAllowedBranch,
  defaultBumpForGitFlowType,
} from "../../.devenv/deps/changeset/add.mjs";
import { isVersionBranch } from "../../.devenv/deps/changeset/version.mjs";
import { parseTagArgs } from "../../.devenv/tools/git/tag-version.mjs";
import { assertPackSmokePaths } from "../../.devenv/tools/npm/pack/smoke.mjs";

describe("label sync helpers", () => {
  it("normalizes label colors", () => {
    expect(normalizeLabelColor("#D73A4A")).toBe("d73a4a");
    expect(normalizeLabelColor("ededed")).toBe("ededed");
  });

  it("matches catalog to remote fields", () => {
    expect(
      labelFieldsMatch(
        { name: "bug", description: "Broken", color: "#d73a4a" },
        { name: "bug", description: "Broken", color: "d73a4a" },
      ),
    ).toBe(true);
    expect(
      labelFieldsMatch(
        { name: "bug", description: "Broken", color: "d73a4a" },
        { name: "bug", description: "Other", color: "d73a4a" },
      ),
    ).toBe(false);
    expect(labelFieldsMatch({ name: "bug" }, undefined)).toBe(false);
  });
});

describe("changeset pending helpers", () => {
  it("detects pending consumer markdown only", () => {
    expect(isPendingChangesetFile("funny-lions-sing.md")).toBe(true);
    expect(isPendingChangesetFile("config.json")).toBe(false);
    expect(isPendingChangesetFile("README.md")).toBe(false);
  });
});

describe("git-flow issue gate helpers", () => {
  it("parses issue slug names", () => {
    expect(parseIssueSlug("42-add-login")).toEqual({ number: "42", slug: "add-login" });
    expect(parseIssueSlug("add-login")).toBe(null);
    expect(parseIssueSlug("1.2.0")).toBe(null);
  });

  it("slugifies issue titles", () => {
    expect(slugifyIssueTitle("✨ FEAT: Add login")).toBe("feat-add-login");
    expect(slugifyIssueTitle("")).toBe("issue");
  });

  it("parses issue form YAML and seeds a draft", () => {
    const yaml = [
      'title: "✨ FEAT: <slug>"',
      'labels: ["✨ Feature Request"]',
      "body:",
      "  - type: markdown",
      "    attributes:",
      "      value: |",
      "        Intro",
      "  - type: textarea",
      "    id: problem",
      "    attributes:",
      '      label: "Problem"',
      "  - type: textarea",
      "    id: change",
      "    attributes:",
      "      label: Proposed change",
    ].join("\n");
    const meta = parseIssueFormYaml(yaml);
    expect(meta.title).toBe("✨ FEAT: <slug>");
    expect(meta.labels).toEqual(["✨ Feature Request"]);
    expect(meta.fieldLabels).toEqual(["Problem", "Proposed change"]);
    const draft = seedIssueDraftFromFormMeta(meta);
    expect(draft).toContain("# ✨ FEAT: <slug>");
    expect(draft).toContain("## Problem");
    expect(draft).toContain("## Proposed change");
  });
});

describe("git-flow edit-draft helpers", () => {
  it("requires a non-comment Summary", () => {
    expect(
      summaryIsFilled("## Summary\n\n<!-- Why this change is needed. -->\n\n## Linked issues\n"),
    ).toBe(false);
    expect(summaryIsFilled("## Summary\n\n\n## Linked issues\n")).toBe(false);
    expect(
      summaryIsFilled("## Summary\n\nShip the issue gate and PR draft.\n\n## Linked issues\n"),
    ).toBe(true);
  });

  it("injects Closes #N into the template line", () => {
    expect(injectClosesIssue("Closes #\n", "42")).toBe("Closes #42\n");
    expect(injectClosesIssue("Closes #\n", null)).toBe("Closes #\n");
  });

  it("parses markdown titles and issue drafts", () => {
    expect(parseMarkdownTitle("# Fix login\n\nBody")).toBe("Fix login");
    expect(parseIssueDraft("# Add export\n\nShip CSV.")).toEqual({
      title: "Add export",
      body: "Ship CSV.",
    });
  });
});

describe("git-flow start-gate helpers", () => {
  it("parses ahead/behind and merge strategies", () => {
    expect(parseAheadBehind("0\t0")).toEqual({ ahead: 0, behind: 0 });
    expect(parseAheadBehind("2 1")).toEqual({ ahead: 2, behind: 1 });
    expect(parseAheadBehind("nope")).toBe(null);
    expect(mergeStrategyFor("feature")).toBe("merge");
    expect(mergeStrategyFor("bugfix")).toBe("merge");
    expect(mergeStrategyFor("release")).toBe("merge");
  });

  it("maps typed starts to matching issue forms", () => {
    expect(issueFormChoiceForGitFlowType("feature")?.file).toBe("feature_request.yml");
    expect(issueFormChoiceForGitFlowType("bugfix")?.file).toBe("bug_report.yml");
    expect(issueFormChoiceForGitFlowType("release")?.file).toBe("chore_docs.yml");
    expect(issueFormChoiceForGitFlowType("hotfix")?.file).toBe("chore_docs.yml");
    expect(issueFormChoiceForGitFlowType("support")?.file).toBe("chore_docs.yml");
    expect(issueFormChoiceForGitFlowType("")).toBe(null);
    expect(issueFormChoiceForGitFlowType(undefined)).toBe(null);
  });

  it("parses --issue from start argv", () => {
    expect(parseIssueFlagArgs(["--issue", "42", "1.2.0"])).toEqual({
      issueFlag: "42",
      rest: ["1.2.0"],
    });
  });
});

describe("git-flow gate helpers", () => {
  it("matches type prefixes and parses ahead/behind", () => {
    expect(branchMatchesType("feature/42-x", "feature")).toBe(true);
    expect(branchMatchesType("bugfix/1-y", "feature")).toBe(false);
    expect(parseGateAheadBehind("0\t0")).toEqual({ ahead: 0, behind: 0 });
  });
});

describe("changeset branch and bump helpers", () => {
  it("gates add and version allow-lists", () => {
    expect(isChangesetAddAllowedBranch("feature/1-x")).toBe(true);
    expect(isChangesetAddAllowedBranch("release/1.0.0")).toBe(false);
    expect(isChangesetAddAllowedBranch("main")).toBe(false);
    expect(isVersionBranch("release/1.0.0")).toBe(true);
    expect(isVersionBranch("hotfix/1.0.1")).toBe(true);
    expect(isVersionBranch("feature/1-x")).toBe(false);
  });

  it("defaults guided bumps by Git Flow type", () => {
    expect(defaultBumpForGitFlowType("feature")).toBe(null);
    expect(defaultBumpForGitFlowType("bugfix")).toBe("patch");
    expect(defaultBumpForGitFlowType("hotfix")).toBe("patch");
    expect(defaultBumpForGitFlowType("support")).toBe("patch");
  });
});

describe("git-flow label helpers", () => {
  it("maps Git Flow defaults and merges without dupes", () => {
    expect(defaultLabelsForGitFlowType("feature")).toEqual(["🌟 Git Flow: Feature"]);
    expect(defaultLabelsForGitFlowType("bugfix")).toEqual(["🐛 Git Flow: Bugfix"]);
    expect(defaultLabelsForGitFlowType("unknown")).toEqual([]);
    expect(
      mergeLabelLists(["✨ Feature Request"], ["🌟 Git Flow: Feature"], ["✨ Feature Request"]),
    ).toEqual(["✨ Feature Request", "🌟 Git Flow: Feature"]);
  });
});

describe("git-flow publish helpers", () => {
  it("parses issue numbers from branch short names", () => {
    expect(parseIssueNumberFromName("42-add-login")).toBe("42");
    expect(parseIssueNumberFromName("1.2.0")).toBe(null);
    expect(parseIssueNumberFromName("1.x")).toBe(null);
    expect(resolvePublishIssueNumber("42-add-login")).toBe("42");
  });

  it("parses publish CLI flags", () => {
    expect(hasAllowNoChangesetFlag(["--allow-no-changeset"])).toBe(true);
    expect(hasAllowNoChangesetFlag([])).toBe(false);
    expect(
      parsePublishArgs([
        "--base",
        "develop",
        "--allow-no-changeset",
        "--body-file",
        "./pr.md",
        "--pr",
        "25",
        "42-x",
      ]),
    ).toEqual({
      base: "develop",
      allowNoChangeset: true,
      bodyFile: "./pr.md",
      prNumber: "25",
      rest: ["42-x"],
    });
  });
});

describe("git-flow finish helpers", () => {
  it("parses finish CLI flags", () => {
    expect(parseFinishArgs(["--base", "main", "--allow-unapproved", "--pr", "25"])).toEqual({
      base: "main",
      allowUnapproved: true,
      prNumber: "25",
      mergeStrategy: undefined,
      rest: [],
    });
    expect(parseFinishArgs(["--merge", "--pr", "26"])).toEqual({
      base: undefined,
      allowUnapproved: false,
      prNumber: "26",
      mergeStrategy: "merge",
      rest: [],
    });
    expect(parseFinishArgs(["--squash"])).toEqual({
      base: undefined,
      allowUnapproved: false,
      prNumber: undefined,
      mergeStrategy: "squash",
      rest: [],
    });
  });

  it("treats successful status checks as green", () => {
    expect(
      isPullRequestCiGreen({
        statusCheckRollup: [{ status: "COMPLETED", conclusion: "SUCCESS" }],
      }),
    ).toBe(true);
    expect(
      isPullRequestCiGreen({
        statusCheckRollup: [{ status: "IN_PROGRESS", conclusion: "" }],
      }),
    ).toBe(false);
  });
});

describe("git tag helper flags", () => {
  it("parses tag CLI flags", () => {
    expect(parseTagArgs(["--push", "--allow-any-branch"])).toEqual({
      push: true,
      allowAnyBranch: true,
    });
  });
});

describe("npm pack smoke assertions", () => {
  it("accepts a typical dry-run path list", () => {
    expect(
      assertPackSmokePaths(["package.json", "dist/index.js", "dist/index.d.ts", "README.md"]).ok,
    ).toBe(true);
  });

  it("rejects missing dist or secrets", () => {
    expect(assertPackSmokePaths(["package.json"]).ok).toBe(false);
    expect(assertPackSmokePaths(["package.json", "dist/index.js", ".env"]).ok).toBe(false);
  });
});
