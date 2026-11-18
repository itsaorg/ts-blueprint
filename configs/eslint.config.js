/** ==============================================================
 * 🧹 ESLint config
 * ---------------------------------------------------------------
 * Flat config for TypeScript, JavaScript, and Prettier.
 *
 * HOW TO RUN:
 *   npm run eslint:lint
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

import { fileURLToPath } from "node:url";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "./.prettierrc.json" with { type: "json" };

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ["tsconfig.eslint.json"],
        tsconfigRootDir: fileURLToPath(new URL("..", import.meta.url)),
      },
    },
    plugins: { prettier },
    rules: {
      "prettier/prettier": ["error", prettierConfig],
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        URL: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
  },
  { ignores: ["dist/**", "coverage/**", "docs/**", "node_modules/**"] },
);
