#!/usr/bin/env node

/** ==============================================================
 * 🧹 ESLint lint
 * ---------------------------------------------------------------
 * Lints the repository with `configs/eslint.config.js` and reports
 * problems without applying fixes. Part of the `check` gate so
 * style and correctness rules fail CI early. Extra ESLint flags
 * can be forwarded after `--`.
 *
 * HOW TO RUN:
 *   npm run eslint:lint
 *   node .devenv/deps/eslint/lint.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `eslint:lint` — lint the repo (report only).
 *
 * @module eslint-lint
 *
 * @example
 * // Surface lint issues without rewriting files:
 * //   npm run eslint:lint
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [".", "--config", "configs/eslint.config.js"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "eslint:lint",
  bin: "eslint",
  args,
});
