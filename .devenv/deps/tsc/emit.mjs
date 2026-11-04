#!/usr/bin/env node

/** ==============================================================
 * 📤 Emit
 * ---------------------------------------------------------------
 * Runs `tsc` against `tsconfig.json` and writes JavaScript plus
 * declaration files into `dist/`. Does not delete the previous
 * output first — use `tsc:build` when you want a clean emit.
 * Extra CLI flags can be forwarded after `--`.
 *
 * HOW TO RUN:
 *   npm run tsc:emit
 *   node .devenv/deps/tsc/emit.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `tsc:emit` — compiles TypeScript into `dist/`.
 *
 * @module tsc-emit
 *
 * @example
 * // Write JS and .d.ts without cleaning first:
 * //   npm run tsc:emit
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--project", "tsconfig.json", "--pretty"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "tsc:emit",
  bin: "tsc",
  args,
});
