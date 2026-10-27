#!/usr/bin/env node

/** ==============================================================
 * 🧰 Tool library
 * ---------------------------------------------------------------
 * Shared helpers for package-agnostic `.devenv` scripts: boxed emoji
 * logs, repo identity, command runners, and TTY prompts.
 *
 * HOW TO RUN:
 *   node .devenv/_/lib/tool-lib.mjs
 *
 * ---------------------------------------------------------------
 * Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
 * Author: Astitv Singh <https://github.com/astitvsingh>
 * SPDX-License-Identifier: Apache-2.0
 * ============================================================== */

/**
 * Shared helpers for package-agnostic `.devenv` tool scripts.
 *
 * 💡 Boxed emoji logging, repo identity, command runners, and TTY prompts.
 * Safe to copy into any repo. The root is the nearest parent with `package.json`.
 *
 * @module tool-lib
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

/**
 * Walks upward from a directory until `package.json` is found.
 *
 * @param {string} startDir - Directory to start from.
 * @returns {string} Absolute repository root.
 * @throws {Error} When no `package.json` exists above `startDir`.
 */
export function findRepoRoot(startDir) {
  let dir = path.resolve(startDir);
  while (true) {
    if (existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("package.json not found above the script directory");
    }
    dir = parent;
  }
}

/**
 * Absolute path to the repository root (nearest parent `package.json`).
 *
 * @type {string}
 */
export const repoRoot = findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));

/**
 * @typedef {object} PackageIdentity
 * @property {string} name - npm package name from `package.json`.
 * @property {string} version - Semver version from `package.json`.
 * @property {string} spec - Combined `name@version` publish specifier.
 *
 * Reads and parses the root `package.json`.
 *
 * @returns {PackageIdentity} Name, version, and combined spec.
 * @throws {Error} When `name` or `version` is missing.
 */
export function readPackageIdentity() {
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  if (typeof pkg.name !== "string" || !pkg.name) {
    throw new Error('package.json is missing a string "name" field');
  }
  if (typeof pkg.version !== "string" || !pkg.version) {
    throw new Error('package.json is missing a string "version" field');
  }
  return {
    name: pkg.name,
    version: pkg.version,
    spec: `${pkg.name}@${pkg.version}`,
  };
}

/**
 * Extra argv after the script name (npm forwards after `--`).
 *
 * @returns {string[]} Forwardable CLI arguments.
 */
export function forwardedArgs() {
  return process.argv.slice(2);
}

/**
 * Runs a shell command in the repo root.
 *
 * @param {string} command - Full command line.
 * @param {{ inherit?: boolean }} [options] - When `inherit` is true (default),
 *   pipe stdio to the parent; otherwise capture stdout.
 * @returns {string} Captured stdout when not inheriting; otherwise `""`.
 */
export function run(command, options = {}) {
  const inherit = options.inherit !== false;
  const result = execSync(command, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
  });
  return inherit ? "" : String(result ?? "").trim();
}

/**
 * Logs an informational line.
 *
 * @param {string} message - Message body.
 * @returns {void}
 */
export function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

/**
 * Logs a success line.
 *
 * @param {string} message - Message body.
 * @returns {void}
 */
export function logOk(message) {
  console.log(`✅ ${message}`);
}

/**
 * Logs a skip / no-op line.
 *
 * @param {string} message - Message body.
 * @returns {void}
 */
export function logSkip(message) {
  console.log(`⏭️  ${message}`);
}

/**
 * Logs an error line.
 *
 * @param {string} message - Message body.
 * @returns {void}
 */
export function logError(message) {
  console.error(`❌ ${message}`);
}

/**
 * Logs a prompt / question line.
 *
 * @param {string} message - Message body.
 * @returns {void}
 */
export function logAsk(message) {
  console.log(`❓ ${message}`);
}

/**
 * Logs a start / action line.
 *
 * @param {string} message - Message body.
 * @returns {void}
 */
export function logGo(message) {
  console.log(`▶️  ${message}`);
}

/**
 * Prints a prettified box banner around a title.
 *
 * @param {string} title - Banner title (emoji allowed).
 * @returns {void}
 */
export function boxBanner(title) {
  const text = ` ${title} `;
  const width = Math.max(text.length + 2, 24);
  const pad = width - text.length;
  const left = Math.floor(pad / 2);
  const right = pad - left;
  const bar = "═".repeat(width);
  console.log(`╔${bar}╗`);
  console.log(`║${" ".repeat(left)}${text}${" ".repeat(right)}║`);
  console.log(`╚${bar}╝`);
}

/**
 * Prints a closing box line for a completed step.
 *
 * @param {string} title - Done title.
 * @returns {void}
 */
export function boxDone(title) {
  const text = ` ✅ ${title} `;
  const width = Math.max(text.length + 2, 24);
  const pad = width - text.length;
  const left = Math.floor(pad / 2);
  const right = pad - left;
  const bar = "─".repeat(width);
  console.log(`┌${bar}┐`);
  console.log(`│${" ".repeat(left)}${text}${" ".repeat(right)}│`);
  console.log(`└${bar}┘`);
}

/**
 * Runs a CLI with boxed logs. Resolves the binary from `node_modules/.bin`.
 *
 * @param {object} options - Run options.
 * @param {string} options.label - Human label for logs (e.g. `tsc:typecheck`).
 * @param {string} options.bin - Binary name under `node_modules/.bin`.
 * @param {string[]} [options.args] - Arguments passed to the binary.
 * @returns {number} Process exit code.
 */
export function runTool(options) {
  const { label, bin, args = [] } = options;
  const { name, version } = readPackageIdentity();
  boxBanner(`▶️  ${label} — ${name}@${version}`);
  const quoted = args.map((arg) => JSON.stringify(arg)).join(" ");
  try {
    run(`npx --no -- ${bin}${quoted ? ` ${quoted}` : ""}`);
    boxDone(label);
    return 0;
  } catch {
    logError(`${label} failed`);
    return 1;
  }
}

/**
 * Runs an npm package script (for orchestration like `check` / `tsc:build`).
 *
 * @param {string} script - Script name (e.g. `vitest:run`).
 * @param {string[]} [args] - Extra args after `--`.
 * @returns {number} Exit code.
 */
export function runNpmScript(script, args = []) {
  const { name, version } = readPackageIdentity();
  boxBanner(`▶️  npm run ${script} — ${name}@${version}`);
  try {
    const extra = args.map((arg) => JSON.stringify(arg)).join(" ");
    run(`npm run ${JSON.stringify(script)}${extra ? ` -- ${extra}` : ""}`);
    boxDone(`npm run ${script}`);
    return 0;
  } catch {
    logError(`npm run ${script} failed`);
    return 1;
  }
}

/**
 * Whether stdin is an interactive TTY.
 *
 * @returns {boolean} True when prompts are allowed.
 */
export function isInteractive() {
  return Boolean(input.isTTY);
}

/**
 * Asks a yes/no question on TTY.
 *
 * @param {string} label - Question text.
 * @param {boolean} [defaultYes=false] - Default on Enter.
 * @returns {Promise<boolean>} True when yes.
 */
export async function askYesNo(label, defaultYes = false) {
  const hint = defaultYes ? "Y/n" : "y/N";
  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question(`❓ ${label} (${hint}): `)).trim().toLowerCase();
    if (answer === "") {
      return defaultYes;
    }
    return /^(y|yes)$/.test(answer);
  } finally {
    rl.close();
  }
}

/**
 * Whether `-y` / `--yes` was passed on argv.
 *
 * @returns {boolean} True when non-interactive yes was requested.
 */
export function hasYesFlag() {
  return process.argv.slice(2).some((arg) => arg === "-y" || arg === "--yes");
}

/**
 * Returns whether any version of the package name exists on the registry.
 *
 * @param {string} name - Package name.
 * @returns {boolean} True when visible on npm.
 */
export function packageNameExistsOnRegistry(name) {
  try {
    run(`npm view "${name}" version`, { inherit: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns whether the exact `name@version` exists on the registry.
 *
 * @param {string} spec - Specifier `name@version`.
 * @returns {boolean} True when visible.
 */
export function packageSpecExistsOnRegistry(spec) {
  try {
    run(`npm view "${spec}" version`, { inherit: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * Prints the npm whoami identity or throws.
 *
 * @returns {string} Logged-in npm username.
 */
export function requireNpmWhoami() {
  try {
    const user = run("npm whoami", { inherit: false });
    if (!user) {
      throw new Error("empty whoami");
    }
    return user;
  } catch {
    throw new Error(
      "npm whoami failed. Log in with an account that can publish under the package scope (npm login), then retry.",
    );
  }
}

/**
 * Reads the latest published version string for a package name, if any.
 *
 * @param {string} name - Package name.
 * @returns {string | null} Version or null.
 */
export function readPublishedVersion(name) {
  try {
    const version = run(`npm view "${name}" version`, { inherit: false });
    return version || null;
  } catch {
    return null;
  }
}

/**
 * Sleeps for a number of milliseconds.
 *
 * @param {number} ms - Duration to wait.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return delay(ms);
}

/**
 * Polls the registry until the package name appears or the timeout elapses.
 *
 * @param {string} name - Package name.
 * @param {{ timeoutMs?: number, intervalMs?: number }} [options] - Poll options.
 * @returns {Promise<string | null>} Version or null.
 */
export async function waitForPackageNameOnRegistry(name, options = {}) {
  const timeoutMs = options.timeoutMs ?? 300_000;
  const intervalMs = options.intervalMs ?? 10_000;
  const started = Date.now();
  let attempt = 0;

  logInfo(
    `Waiting up to ${Math.round(timeoutMs / 1000)}s for npm to show ${name} (poll every ${Math.round(intervalMs / 1000)}s)…`,
  );

  while (Date.now() - started < timeoutMs) {
    attempt += 1;
    const version = readPublishedVersion(name);
    if (version) {
      logOk(
        `Registry shows ${name}@${version} after ~${Math.round((Date.now() - started) / 1000)}s (${attempt} poll(s)).`,
      );
      return version;
    }
    const elapsed = Math.round((Date.now() - started) / 1000);
    const remaining = Math.max(0, Math.round((timeoutMs - (Date.now() - started)) / 1000));
    logInfo(`Poll #${attempt}: not visible yet (elapsed ${elapsed}s, ~${remaining}s left).`);
    const slice = Math.min(intervalMs, timeoutMs - (Date.now() - started));
    if (slice <= 0) {
      break;
    }
    await sleep(slice);
  }

  const finalVersion = readPublishedVersion(name);
  if (finalVersion) {
    logOk(`Registry shows ${name}@${finalVersion} on final check.`);
    return finalVersion;
  }
  logError(`Timed out after ${Math.round(timeoutMs / 1000)}s waiting for ${name} on npm.`);
  return null;
}

/**
 * Parses `owner/repo` from a git remote URL.
 *
 * @param {string} remoteUrl - Origin URL.
 * @returns {string | null} owner/repo or null.
 */
export function parseGithubOwnerRepo(remoteUrl) {
  const trimmed = remoteUrl.trim().replace(/\.git$/i, "");
  const ssh = trimmed.match(/^git@github\.com:([^/]+)\/(.+)$/i);
  if (ssh) {
    return `${ssh[1]}/${ssh[2]}`;
  }
  const https = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/(.+)$/i);
  if (https) {
    return `${https[1]}/${https[2]}`;
  }
  return null;
}

/**
 * Resolves `owner/repo` from the local `origin` remote.
 *
 * @returns {string} GitHub owner/repo.
 */
export function requireGithubOwnerRepo() {
  let remoteUrl;
  try {
    remoteUrl = run("git remote get-url origin", { inherit: false });
  } catch {
    throw new Error("git remote get-url origin failed. Set origin to the GitHub repo first.");
  }
  const ownerRepo = parseGithubOwnerRepo(remoteUrl);
  if (!ownerRepo) {
    throw new Error(`Could not parse GitHub owner/repo from origin: ${remoteUrl}`);
  }
  return ownerRepo;
}
