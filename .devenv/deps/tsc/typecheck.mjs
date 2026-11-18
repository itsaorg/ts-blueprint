#!/usr/bin/env node

/** ==============================================================
 * 🔎 Typecheck
 * ---------------------------------------------------------------
 * Runs the TypeScript compiler with `--noEmit` so types are
 * checked without writing any `dist/` output. Forward extra flags
 * after `--` if you need them. Prefer this in CI and local gates
 * before a full emit.
 *
 * HOW TO RUN:
 *   npm run tsc:typecheck
 *   node .devenv/deps/tsc/typecheck.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `tsc:typecheck` — type-checks via `tsc --noEmit`.
 *
 * @module tsc-typecheck
 *
 * @example
 * // Fail fast on type errors without writing dist/:
 * //   npm run tsc:typecheck
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--project", "tsconfig.json", "--noEmit", "--pretty"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "tsc:typecheck",
  bin: "tsc",
  args,
});
