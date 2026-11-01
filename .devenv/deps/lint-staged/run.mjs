#!/usr/bin/env node

/** ==============================================================
 * 🪄 lint-staged
 * ---------------------------------------------------------------
 * Runs the `lint-staged` config from `package.json` against files
 * currently staged in git (typically Prettier write + ESLint fix
 * for matching globs). Invoked from the Husky `pre-commit` hook;
 * safe to run manually before committing.
 *
 * HOW TO RUN:
 *   npm run lint-staged
 *   node .devenv/deps/lint-staged/run.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `lint-staged` — format/lint only staged files.
 *
 * @module lint-staged
 *
 * @example
 * // Apply staged-file formatters before commit:
 * //   npm run lint-staged
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [].concat(forwardedArgs());
process.exitCode = runTool({
  label: "lint-staged",
  bin: "lint-staged",
  args,
});
