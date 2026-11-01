#!/usr/bin/env node

/** ==============================================================
 * 📖 TypeDoc
 * ---------------------------------------------------------------
 * Generates API docs, then syncs community docs into docs/media.
 *
 * HOW TO RUN:
 *   npm run typedoc:build
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `typedoc:build` — Generates API docs and media copies.
 *
 * @module typedoc
 */

import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { forwardedArgs, logGo, logOk, repoRoot, runTool } from "../../lib/tool-lib.mjs";

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
];
logGo("Sync docs/media from .github");
for (const [fromRel, toRel] of copies) {
  copyFileSync(path.join(repoRoot, fromRel), path.join(repoRoot, toRel));
  logOk(`copied ${fromRel} → ${toRel}`);
}
process.exitCode = 0;
