#!/usr/bin/env node

/** ==============================================================
 * 📖 TypeDoc build
 * ---------------------------------------------------------------
 * Generates API documentation with TypeDoc (`configs/typedoc.json`),
 * then copies selected community guides from `.github/` into
 * `docs/media/` so the site can link them. Prefer `docify:typedoc`
 * when you also want a clean `docs/` wipe first.
 *
 * HOW TO RUN:
 *   npm run typedoc:build
 *   node .devenv/deps/typedoc/build.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `typedoc:build` — API docs plus `docs/media` sync.
 *
 * @module typedoc
 *
 * @example
 * // Build docs and refresh media copies:
 * //   npm run typedoc:build
 */

import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { forwardedArgs, logGo, logOk, repoRoot, runTool } from "../../lib/tool-lib.mjs";
import { applyTypedocMinimatch11Patch } from "./apply-minimatch11-patch.mjs";

logGo("typedoc minimatch 11 patch");
applyTypedocMinimatch11Patch();

const args = ["--options", "configs/typedoc.json"].concat(forwardedArgs());
const code = runTool({
  label: "typedoc:build",
  bin: "typedoc",
  args,
});
if (code !== 0) {
  process.exitCode = code;
  process.exit(code);
}

const mediaDir = path.join(repoRoot, "docs", "media");
mkdirSync(mediaDir, { recursive: true });
const copies = [
  [".github/CONTRIBUTING.md", "docs/media/CONTRIBUTING.md"],
  [".github/HOW-TO.md", "docs/media/HOW-TO.md"],
  [".github/SECURITY.md", "docs/media/SECURITY.md"],
  [".github/CODE_OF_CONDUCT.md", "docs/media/CODE_OF_CONDUCT.md"],
  [".github/SUPPORT.md", "docs/media/SUPPORT.md"],
  ["LICENSE", "docs/media/LICENSE"],
];
logGo("Sync docs/media from .github");
for (const [fromRel, toRel] of copies) {
  copyFileSync(path.join(repoRoot, fromRel), path.join(repoRoot, toRel));
  logOk(`copied ${fromRel} → ${toRel}`);
}
process.exitCode = 0;
