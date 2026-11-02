# @itsaorg/ts-blueprint

[![CI](https://github.com/itsaorg/ts-blueprint/actions/workflows/ci.yml/badge.svg)](https://github.com/itsaorg/ts-blueprint/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-26-brightgreen.svg)](https://nodejs.org/)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-0A66C2.svg)](https://itsaorg.github.io/ts-blueprint/)

GitHub template for Itsa TypeScript libraries. Clone from this repository, rename the package identity, then start product code under `src/`.

## 🗂️ Table Of Contents

- [@itsaorg/ts-blueprint](#itsaorgts-blueprint)
  - [🗂️ Table Of Contents](#️-table-of-contents)
  - [📋 Requirements](#-requirements)
  - [🏗️ Use this template](#️-use-this-template)
  - [✏️ Rename checklist](#️-rename-checklist)
  - [✅ Readiness](#-readiness)
    - [P2 backlog (later)](#p2-backlog-later)
  - [🗺️ Layout](#️-layout)
  - [⌨️ Key scripts](#️-key-scripts)
  - [🔗 Links](#-links)

## 📋 Requirements

- Node.js 26 (see `.nvmrc`)
- npm (ships with Node)
- Git
- Git Flow AVH, if you start topic branches with `git flow` or the `.devenv/tools/git-flow/*` helpers

On Windows, use Git Bash. Install Node from [nodejs.org](https://nodejs.org/), nvm-windows, or fnm. Install Git Flow AVH from the [AVH wiki](https://github.com/petervanderdoes/gitflow-avh/wiki/Installation), then verify with `git flow version`. Prepare soft-skips init when AVH is missing; start/publish/finish helpers print the same install guide and exit.

## 🏗️ Use this template

1. Open [itsaorg/ts-blueprint](https://github.com/itsaorg/ts-blueprint) on GitHub.
2. Click **Use this template** → **Create a new repository**.
3. Choose owner, name, and visibility. Create the repository.
4. On the template dialog, **include all branches** (not only the default). This repo’s CI and Git Flow expect a `develop` branch on the remote. If you already created the repo without it, push `develop` from this template before day-to-day work:

```bash
git fetch origin
git checkout develop
git push -u origin develop
```

1. Clone your new repository and install:

```bash
git clone <your-repo-HTTPS-URL>
cd <your-repo-directory>
npm clean-install
```

For machine probes, install, and the CI gate:

```bash
npm run setup
```

`npm clean-install` runs `prepare` (Husky, commit template, gh/npm auth when possible, label sync, git-flow init with tag prefix `v`). Prefer `npm clean-install` for a clean checkout (long form of the old `npm ci` alias). Use `npm install` only when refreshing the lockfile.

## ✏️ Rename checklist

Replace blueprint identity with your package before you publish or open Trusted Publishing:

| Location                            | What to change                                                          |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `package.json`                      | `name`, `description`, `keywords`, `repository.url`, `bugs`, `homepage` |
| `package-lock.json`                 | Refresh via `npm install` after renaming `package.json`                 |
| `NOTICE`                            | Package name and one-line description                                   |
| `CHANGELOG.md`                      | Clear or rewrite for your first release                                 |
| `configs/typedoc.json`              | `"name"`                                                                |
| `src/**` file banners and examples  | Package import name                                                     |
| `tests/consumer/public-api.test.ts` | Uses `package.json` `name` automatically; no edit needed after rename   |
| npm Trusted Publishing              | `npm run npm:trust` after the GitHub repo and `release.yml` exist       |
| Labels                              | `npm run gh:label:sync` when `gh` is authenticated                      |
| GitHub repo settings                | Description, topics, Pages (if you publish `docs/`)                     |
| `.github/CODEOWNERS`                | Replace default owners with your org/team                               |
| `.github/SUPPORT.md`                | Point issue links at your repository                                    |

Do not change portable paths under `.devenv` or the community policy files under `.github/` unless you mean to fork the toolchain.

## ✅ Readiness

**Ready to use (P0/P1):** clone as a GitHub template for day-to-day library work. Audit is clean via `overrides.minimatch`, YAML issue forms only, Changesets + `v*` tag publish, Git Flow PR-first finish, `prepublishOnly` → `tsc:build`, OIDC `registry-url` on setup-node, CODEOWNERS + SUPPORT, mandatory `main` → `develop` back-merge after release/hotfix.

Release model: accumulate Changesets files on `develop` → run `changeset:version` only on `release/*` or `hotfix/*` → PR into `main` → tag `v<version>` → `release.yml` publishes → PR `main` into `develop`.

### P2 backlog (later)

**Community / GitHub polish**:

- [ ] `.github/FUNDING.yml` — e.g. `github: [astitvsingh]` and/or org sponsors when real
- [ ] Optional `.github/DISCUSSION_TEMPLATE/` if Discussions are enabled
- [ ] `.github/CITATION.cff` if the package should be citable
- [ ] Extra support links in SUPPORT (Discord/forum) if the org has them

**Release / automation**:

- [ ] Optional Changesets GitHub Action that still respects version-branch rules
- [ ] Scripted tag helper after merge (docs already show `git tag v$(node -p …)`)
- [ ] Branch protection guidance for `main`/`develop` (org settings)
- [ ] Dependabot/Renovate tuning for the eslint/typedoc stack
- [ ] npm provenance badge after the first real publish
- [ ] Confirm Trusted Publisher binding after `npm:trust` on a renamed package

**Quality / toolchain**:

- [ ] devenv unit tests (`tool-lib`, git-flow guards, label sync dry-run)
- [ ] Node matrix in CI if more than `.nvmrc` major is supported
- [ ] `prepublishOnly` smoke path in CI
- [ ] Drop or document `.devenv/deps/changelog/generate.mjs` vs Changesets-owned CHANGELOG
- [ ] Remove `minimatch` override + TypeDoc patch when upstream supports minimatch >=11.0.1

**Template product**:

- [ ] Consumer clone dry-run checklist (rename → setup → feature → release dry-run)
- [ ] Org-level template defaults (topics, Pages `docs/`, default branch policy)
- [ ] Optional monorepo notes (out of scope until needed)

## 🗺️ Layout

```text
.devenv/            Script library (prepare, setup, lib, tools, deps, utils)
.husky/             Git hooks (Husky)
.github/            Issues, PRs, workflows, labels, CONTRIBUTING
configs/            ESLint, Prettier, Vitest, TypeDoc, tsconfig pieces
docs/               TypeDoc GitHub Pages site (tracked)
src/                Library source (`base/`, `types/`, package root)
tests/              Consumer and unit tests
```

`docs/` is the TypeDoc GitHub Pages site. Regenerate with `npm run docify:typedoc` and commit when the public API changes.

## ⌨️ Key scripts

| Script                   | Purpose                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `npm run setup`          | Git/Node checks, `npm clean-install` (runs `prepare`), then `check` |
| `npm run gh:label:sync`  | Sync `.github/labels.json` with `gh`                                |
| `npm run gh:setup`       | Ensure `gh` auth, then sync labels                                  |
| `npm run check`          | Typecheck, format, lint, layout, tests, build                       |
| `npm run docify:typedoc` | Regenerate the Pages site into `docs/`                              |

The full script table and prepare/setup order live in [CONTRIBUTING](.github/CONTRIBUTING.md). Tutorials are in [HOW-TO](.github/HOW-TO.md).

## 🔗 Links

- [Contributing](.github/CONTRIBUTING.md)
- [How-to FAQ](.github/HOW-TO.md)
- [Support](.github/SUPPORT.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security](.github/SECURITY.md)
- [License](LICENSE)
