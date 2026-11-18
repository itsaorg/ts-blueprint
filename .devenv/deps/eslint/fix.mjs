#!/usr/bin/env node

/** ==============================================================
 * 🔧 ESLint fix
 * ---------------------------------------------------------------
 * Runs ESLint with `--fix` so safe autofixes are applied in
 * place. Uses the same `configs/eslint.config.js` as `eslint:lint`.
 * Review the diff afterward — not every finding is autofixable.
 *
 * HOW TO RUN:
 *   npm run eslint:fix
 *   node .devenv/deps/eslint/fix.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `eslint:fix` — lint and apply safe autofixes.
 *
 * @module eslint-fix
 *
 * @example
 * // Autofix what ESLint can, then review remaining issues:
 * //   npm run eslint:fix
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = [".", "--config", "configs/eslint.config.js", "--fix"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "eslint:fix",
  bin: "eslint",
  args,
});
