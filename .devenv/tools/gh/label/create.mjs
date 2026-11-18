#!/usr/bin/env node

/** ==============================================================
 * 🏷️ Create or force-update one label
 * ---------------------------------------------------------------
 * Creates (or force-updates) one repository label via
 * `gh label create --force`. Used by label sync for each catalog
 * entry. Requires `gh` auth with repo access. Pass `--name` and
 * optionally `--color` / description flags from the CLI.
 *
 * HOW TO RUN:
 *   node .devenv/tools/gh/label/create.mjs --name "bug" --color d73a4a
 *   npm run gh:label:sync
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Creates or force-updates a single repository label.
 *
 * @module label-create
 *
 * @example
 * //   node .devenv/tools/gh/label/create.mjs --name "bug" --color d73a4a
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  boxBanner,
  boxDone,
  forwardedArgs,
  logError,
  logGo,
  logOk,
  repoRoot,
} from "../../../lib/tool-lib.mjs";

/**
 * Creates or force-updates one label.
 *
 * @param {{ name: string, description?: string, color?: string }} label - Label fields.
 * @returns {"OK" | "FAILED"} Status token.
 *
 * @example
 * createLabel({ name: "bug", color: "d73a4a", description: "Something broken" });
 */
export function createLabel(label) {
  const name = label.name;
  const description = label.description || "";
  const color = String(label.color || "ededed").replace(/^#/, "");
  logGo(`gh label create ${JSON.stringify(name)} --force`);
  try {
    execFileSync(
      "gh",
      ["label", "create", name, "--description", description, "--color", color, "--force"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    logOk(`Label written: ${name}`);
    return "OK";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError(`Failed: ${name} — ${message}`);
    return "FAILED";
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  boxBanner("🏷️ create label");
  const args = forwardedArgs();
  const nameFlag = args.indexOf("--name");
  const colorFlag = args.indexOf("--color");
  const descriptionFlag = args.indexOf("--description");
  const name = nameFlag === -1 ? "" : args[nameFlag + 1] || "";
  if (!name) {
    logError("Pass --name <label>.");
    process.exit(1);
  }
  const status = createLabel({
    name,
    description: descriptionFlag === -1 ? "" : args[descriptionFlag + 1] || "",
    color: colorFlag === -1 ? "ededed" : args[colorFlag + 1],
  });
  if (status === "FAILED") {
    process.exit(1);
  }
  boxDone("create label");
}
