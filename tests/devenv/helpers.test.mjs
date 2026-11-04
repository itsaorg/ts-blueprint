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

describe("git-flow publish helpers", () => {
  it("parses issue numbers from branch short names", () => {
    expect(parseIssueNumberFromName("42-add-login")).toBe("42");
    expect(parseIssueNumberFromName("1.2.0")).toBe(null);
    expect(parseIssueNumberFromName("1.x")).toBe(null);
  });

  it("parses publish CLI flags", () => {
    expect(hasAllowNoChangesetFlag(["--allow-no-changeset"])).toBe(true);
    expect(hasAllowNoChangesetFlag([])).toBe(false);
    expect(parsePublishArgs(["--base", "develop", "--allow-no-changeset", "42-x"])).toEqual({
      base: "develop",
      allowNoChangeset: true,
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
