#!/usr/bin/env node

/** ==============================================================
 * 📤 Publish worker
 * ---------------------------------------------------------------
 * Publishes the current version when it is missing from npm.
 *
 * HOW TO RUN:
 *   npm run npm:publish:worker
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `npm:publish:worker` — non-interactive publish-if-missing (CI).
 *
 * @module npm-publish-worker
 */

import {
  boxBanner,
  boxDone,
  logError,
  logGo,
  logInfo,
  logOk,
  logSkip,
  packageSpecExistsOnRegistry,
  readPackageIdentity,
  run,
} from "../../lib/tool-lib.mjs";

/**
 * Publishes the current package.json version when missing from the registry.
 *
 * @returns {void}
 */
function main() {
  const { name, version, spec } = readPackageIdentity();
  boxBanner(`▶️  npm:publish:worker — ${name}@${version}`);
  logInfo(`Local package: ${spec}`);

  if (packageSpecExistsOnRegistry(spec)) {
    logSkip(`${spec} is already on npm; skipping publish.`);
    process.exitCode = 0;
    return;
  }

  const provenance = process.env.GITHUB_ACTIONS ? " --provenance" : "";
  logGo(`Publishing ${spec}${provenance ? " with provenance" : ""}…`);
  run(`npm publish --access public${provenance}`);
  logOk(`Published ${spec}.`);
  boxDone("npm:publish:worker");
  process.exitCode = 0;
}

try {
  main();
} catch (error) {
  logError(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
