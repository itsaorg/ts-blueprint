#!/usr/bin/env sh
# ==============================================================
# 🧰 Hook helpers
# ---------------------------------------------------------------
# Shared helpers for package-agnostic Git hooks. Gates live in
# `npm run check` (`.devenv/_`).
#
# HOW TO RUN:
#   Sourced by each hook after HUSKY_DIR is set.
#
# ---------------------------------------------------------------
# Copyright 2025-2026 © Astitv Singh <https://github.com/astitvsingh>.
# Author: Astitv Singh <https://github.com/astitvsingh>
# SPDX-License-Identifier: Apache-2.0
# ==============================================================
# =============================================================================
# 🧰 .husky/common.sh — shared helpers for package-agnostic Git hooks
# =============================================================================
# 📌 Purpose: resolve the repo root, read package.json identity dynamically,
#    and provide emoji log helpers. Gates live in `npm run check` (`.devenv/_`).
# ⚠️ Do NOT source .husky/_/husky.sh (deprecated in Husky v9+, fails in v10).
# 📥 Usage: each hook sets HUSKY_DIR then runs `. "$HUSKY_DIR/common.sh"`.
# =============================================================================

# 🧪 if: run the then-branch only when HUSKY_DIR is empty / unset
# 🔤 -z: true when the expanded string length is zero
# 🔤 ${HUSKY_DIR:-}: expand HUSKY_DIR, or empty string if unset (nounset-safe)
if [ -z "${HUSKY_DIR:-}" ]; then
  # 📁 HUSKY_DIR: absolute path to this `.husky/` directory
  # 🔤 CDPATH=: clear CDPATH so `cd` never jumps via a CDPATH hit
  # 🔤 cd --: change directory; `--` ends option parsing (safe for odd paths)
  # 🔤 dirname "$0": directory containing this script (when sourced via path)
  # 🔤 pwd: print absolute working directory after the cd
  HUSKY_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
# 🔚 fi: end of the HUSKY_DIR bootstrap if
fi

# 📁 REPO_ROOT: absolute path to the git repo root (parent of `.husky/`)
# 🔤 $HUSKY_DIR/..: one level up from `.husky/`
REPO_ROOT="$(CDPATH= cd -- "$HUSKY_DIR/.." && pwd)"

# 🏠 cd: make the shell cwd the repo root so `npm run` finds package.json
# 🔤 || exit 1: if cd fails, abort the hook with a non-zero status
cd "$REPO_ROOT" || exit 1

# 📦 PKG_NAME: npm package name from root package.json (dynamic; not hard-coded)
# 🔤 $(...): capture stdout of the command substitution
# 🔤 node -e: run an inline JavaScript one-liner
# 🔤 require('./package.json'): load JSON as a CommonJS module (Node)
# 🔤 process.stdout.write: print name without an extra trailing newline
PKG_NAME="$(
  node -e "const p=require('./package.json'); process.stdout.write(String(p.name||''))"
)"

# 📦 PKG_VERSION: semver string from root package.json
PKG_VERSION="$(
  node -e "const p=require('./package.json'); process.stdout.write(String(p.version||''))"
)"

# ℹ️ log_info MESSAGE — print an informational line to stdout
# 🔤 log_info(): POSIX function definition (name then body in braces)
log_info() {
  # 🖨️ printf: format print; '%s\n' is the string + newline; "$*" is all args joined
  printf '%s\n' "ℹ️  $*"
}

# ✅ log_ok MESSAGE — print a success line to stdout
log_ok() {
  printf '%s\n' "✅ $*"
}

# ▶️ log_go MESSAGE — print a start / action line to stdout
log_go() {
  printf '%s\n' "▶️  $*"
}

# ❌ log_err MESSAGE — print an error line to stderr
log_err() {
  # 🔤 >&2: redirect this printf to file descriptor 2 (stderr)
  printf '%s\n' "❌ $*" >&2
}

# 🏷️ log_hook_banner HOOK_NAME — standard hook header with package identity
# ▶️ Usage: log_hook_banner "pre-commit"
log_hook_banner() {
  # 🔤 $1: first positional argument = hook name string
  _hook_name="$1"
  # 🏷️ log which husky hook is running and for which package@version
  log_go "husky ${_hook_name} — ${PKG_NAME}@${PKG_VERSION}"
  # 📁 remind operators of the resolved repo root
  log_info "Repo root: ${REPO_ROOT}"
}
