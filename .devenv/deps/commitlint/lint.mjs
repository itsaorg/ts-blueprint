#!/usr/bin/env node

/** ==============================================================
 * ✉️ Commitlint
 * ---------------------------------------------------------------
 * Validates a commit message against `configs/commitlint.config.js`
 * (conventional commits). Usually invoked from the Husky
 * `commit-msg` hook; you can also pipe a message or pass
 * `--edit` / `--from` flags for local checks.
 *
 * HOW TO RUN:
 *   npm run commitlint
 *   node .devenv/deps/commitlint/lint.mjs --edit .git/COMMIT_EDITMSG
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `commitlint` — lint a commit message.
 *
 * @module commitlint
 *
 * @example
 * // Lint the message currently being composed:
 * //   node .devenv/deps/commitlint/lint.mjs --edit .git/COMMIT_EDITMSG
 */

import { forwardedArgs, runTool } from "../../lib/tool-lib.mjs";

const args = ["--config", "configs/commitlint.config.js"].concat(forwardedArgs());
process.exitCode = runTool({
  label: "commitlint",
  bin: "commitlint",
  args,
});
