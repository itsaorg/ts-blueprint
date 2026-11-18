/** ==============================================================
 * 🧪 Public API test
 * ---------------------------------------------------------------
 * Consumer test for the package entry: one root export and no
 * deep imports.
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
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import * as api from "../../src/index.js";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  name: string;
  exports: Record<string, unknown>;
  dependencies?: Record<string, string>;
};

describe("public API", () => {
  it("loads the package entry and keeps a single root export", () => {
    expect(Object.keys(api)).toEqual([]);
    expect(typeof pkg.name).toBe("string");
    expect(pkg.name.length).toBeGreaterThan(0);
    expect(Object.keys(pkg.exports)).toEqual(["."]);
    expect(pkg.dependencies ?? {}).toEqual({});
  });

  it("rejects a deep import", () => {
    const deep = `${pkg.name}/src/base/index.js`;
    expect(() =>
      execFileSync(
        process.execPath,
        ["--input-type=module", "-e", `await import(${JSON.stringify(deep)})`],
        {
          stdio: "pipe",
        },
      ),
    ).toThrow();
  });
});
