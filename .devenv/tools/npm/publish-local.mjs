#!/usr/bin/env node

/** ==============================================================
 * 📤 Publish local
 * ---------------------------------------------------------------
 * Interactive name reservation on npm.
 *
 * HOW TO RUN:
 *   npm run npm:publish:local
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * npm script `npm:publish:local` — interactive, idempotent name reservation.
 *
 * @module npm-publish-local
 */

import {
  askYesNo,
  boxBanner,
  boxDone,
  isInteractive,
  logError,
  logGo,
  logInfo,
  logOk,
  logSkip,
  packageNameExistsOnRegistry,
  readPackageIdentity,
  readPublishedVersion,
  requireNpmWhoami,
  run,
  waitForPackageNameOnRegistry,
} from "../../lib/tool-lib.mjs";

/**
 * Reserves the package name on the public npm registry when still free.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const { name, version, spec } = readPackageIdentity();
  boxBanner(`▶️  npm:publish:local — ${name}@${version}`);

  logInfo(`Package name: ${name}`);
  logInfo(`Local version: ${version}`);
  logInfo(`Publish spec: ${spec}`);

  const user = requireNpmWhoami();
  logOk(`npm whoami: ${user}`);

  if (packageNameExistsOnRegistry(name)) {
    const published = readPublishedVersion(name);
    logSkip(
      `${name} is already on npm` +
        (published ? ` (latest: ${published})` : "") +
        ". Name reservation is done; no publish.",
    );
    process.exitCode = 0;
    return;
  }

  logInfo(`${name}@${version} is not on the registry yet.`);

  if (!isInteractive()) {
    logError(
      "Refusing to publish without a TTY. Run `npm run npm:publish:local` interactively, or skip if reserved.",
    );
    process.exitCode = 1;
    return;
  }

  const confirmed = await askYesNo(
    `Publish ${name}@${version} (${spec}) with --access public (no provenance) to reserve the name?`,
    false,
  );
  if (!confirmed) {
    logSkip("Publish cancelled by user.");
    process.exitCode = 0;
    return;
  }

  logGo("Building package…");
  run("npm run tsc:build");

  logGo(`Publishing ${name}@${version}…`);
  run("npm publish --access public");

  const after = await waitForPackageNameOnRegistry(name, {
    timeoutMs: 300_000,
    intervalMs: 10_000,
  });
  if (!after) {
    logError(
      `Publish finished but npm still does not show "${name}" after 300s. Check https://www.npmjs.com/package/${name} manually.`,
    );
    process.exitCode = 1;
    return;
  }

  logOk(`Reserved ${name} on npm (registry version ${after}; local was ${version}).`);
  boxDone("npm:publish:local");
  process.exitCode = 0;
}

main().catch((error) => {
  logError(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
