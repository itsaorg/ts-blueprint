#!/usr/bin/env node

/** ==============================================================
 * 🚀 Setup
 * ---------------------------------------------------------------
 * Entry point for a new working tree. Calls devenv-setup.
 *
 * HOW TO RUN:
 *   npm run setup
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Runs the development-environment setup.
 *
 * @module setup
 */

import { boxBanner, logGo } from "../lib/tool-lib.mjs";
import { runSetup } from "./devenv-setup.mjs";

boxBanner("🚀 setup");
logGo("devenv-setup");
process.exit(runSetup());
