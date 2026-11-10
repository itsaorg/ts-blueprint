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
} from "../../.devenv/tools/git-flow/edit-draft.mjs";
import {
  parseIssueFormYaml,
  parseIssueSlug,
  seedIssueDraftFromFormMeta,
  slugifyIssueTitle,
} from "../../.devenv/tools/git-flow/issue-gate.mjs";
import {
  hasAllowNoChangesetFlag,
  parseBaseArgs as parsePublishArgs,
  parseIssueNumberFromName,
} from "../../.devenv/tools/git-flow/publish-flow.mjs";
import { parseBaseArgs as parseFinishArgs } from "../../.devenv/tools/git-flow/finish-merged.mjs";
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

describe("git-flow publish helpers", () => {
  it("parses issue numbers from branch short names", () => {
    expect(parseIssueNumberFromName("42-add-login")).toBe("42");
    expect(parseIssueNumberFromName("1.2.0")).toBe(null);
    expect(parseIssueNumberFromName("1.x")).toBe(null);
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
        "42-x",
      ]),
    ).toEqual({
      base: "develop",
      allowNoChangeset: true,
      bodyFile: "./pr.md",
      rest: ["42-x"],
    });
  });
});

describe("git-flow finish helpers", () => {
  it("parses finish CLI flags", () => {
    expect(parseFinishArgs(["--base", "main", "--allow-unapproved"])).toEqual({
      base: "main",
      allowUnapproved: true,
      rest: [],
    });
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
