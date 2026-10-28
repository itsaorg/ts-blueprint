#!/usr/bin/env node

/** ==============================================================
 * 🔄 Post-clone
 * ---------------------------------------------------------------
 * Entry point after git clone. Calls post-clone-run.
 *
 * HOW TO RUN:
 *   npm run setup:post-clone
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Runs the post-clone sequence.
 *
 * @module post-clone
 */

import { boxBanner, logGo } from "../lib/tool-lib.mjs";
import { runPostClone } from "./post-clone-run.mjs";

boxBanner("🔄 post-clone");
logGo("post-clone-run");
process.exit(runPostClone());
