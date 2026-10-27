/** ==============================================================
 * 🧪 Vitest config
 * ---------------------------------------------------------------
 * Test pool, include globs, and coverage reporters.
 *
 * HOW TO RUN:
 *   npm run vitest:run
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  root,
  test: {
    pool: "vmForks",
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.ts",
      "tests/consumer/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
