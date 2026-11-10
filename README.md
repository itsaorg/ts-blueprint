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
  - [⚙️ Operator / GitHub settings](#️-operator--github-settings)
  - [✅ Readiness](#-readiness)
    - [P2 backlog (later)](#p2-backlog-later)
  - [🗺️ Layout](#️-layout)
  - [⌨️ Key scripts](#️-key-scripts)
  - [🔗 Links](#-links)

## 📋 Requirements

- Node.js 26 (see `.nvmrc`; CI and `engines.node` are this major only)
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

5. Clone your new repository and install:

```bash
git clone <your-repo-HTTPS-URL>
cd <your-repo-directory>
npm clean-install
```

6. For machine probes, install, and the CI gate:

```bash
npm run setup
```

`npm clean-install` runs `prepare` (Husky, commit template, gh/npm auth when possible, label sync, git-flow init with tag prefix `v`). Prefer `npm clean-install` for a clean checkout (long form of the old `npm ci` alias). Use `npm install` only when refreshing the lockfile.

## ✏️ Rename checklist

Replace blueprint identity with your package before you publish or open Trusted Publishing:

| Location                            | What to change                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `package.json`                      | `name`, `description`, `keywords`, `repository.url`, `bugs`, `homepage`, `author`, `funding` |
| `package-lock.json`                 | Refresh via `npm install` after renaming `package.json`                                      |
| `NOTICE`                            | Package name and one-line description                                                        |
| `CHANGELOG.md`                      | Clear or rewrite for your first release (Changesets owns later entries)                      |
| `.github/CITATION.cff`              | Title, authors, `repository-code`, `url`                                                     |
| `.github/FUNDING.yml`               | Sponsors handle                                                                              |
| `configs/typedoc.json`              | `"name"`                                                                                     |
| `src/**` file banners and examples  | Package import name                                                                          |
| `tests/consumer/public-api.test.ts` | Uses `package.json` `name` automatically; no edit needed after rename                        |
| npm Trusted Publishing              | `npm run npm:trust` after the GitHub repo and `release.yml` exist                            |
| Labels                              | `npm run gh:label:sync` when `gh` is authenticated                                           |
| GitHub repo settings                | See [Operator / GitHub settings](#️-operator--github-settings)                                |
| `.github/CODEOWNERS`                | Replace default owners with your org/team                                                    |
| `.github/SUPPORT.md`                | Point issue links at your repository                                                         |

Do not change portable paths under `.devenv` or the community policy files under `.github/` unless you mean to fork the toolchain.

## ⚙️ Operator / GitHub settings

These cannot live only in git. After creating the repo from the template:

- [ ] Mark the repository as a **Template repository** (Settings → General) if clones should offer “Use this template”
- [ ] Enable **GitHub Pages** from the `/docs` folder on `main` (or your docs branch)
- [ ] Protect `main` and `develop` (required checks: `ci` / `check`; dismiss stale reviews as you prefer)
- [ ] Bind npm **Trusted Publisher** to this repo’s `.github/workflows/release.yml` (`npm run npm:trust` after rename)
- [ ] Optionally enable **Discussions** so `.github/DISCUSSION_TEMPLATE/` forms appear
- [ ] Set description, topics, and homepage URL to match the renamed package

## ✅ Readiness

**Ready to use (P0/P1 + closed P2 gaps in-repo):** clone as a GitHub template for day-to-day library work through PR → Changesets → tag → npm Trusted Publishing. Includes publish/finish gate bypasses (policy C), `git:tag:version`, `npm:pack:smoke` in CI, FUNDING/CITATION/Discussion templates, package.json polish (`author`/`funding`/`sideEffects`, no lockfile in tarball), and Changesets-only CHANGELOG ownership.

Release model: `changeset:add` on topic branches → publish opens the PR → merge → finish cleans up → on `release/*` or `hotfix/*` run `changeset:version` → publish into `main` → `npm run git:tag:version -- --push` → `release.yml` publishes → PR `main` into `develop`.

Chore/docs or empty support publish without a bump: `npm run git:flow:<type>:publish -- --allow-no-changeset` (or confirm on a TTY). Solo finish without an approving review: `npm run git:flow:<type>:finish -- --allow-unapproved` (or confirm on a TTY). Merged + issue-link gates stay hard.

### P2 backlog (later)

**Still open (upstream / org / optional):**

- [ ] Extra support links in SUPPORT (Discord/forum) if the org has them
- [ ] Optional Changesets GitHub Action that still respects version-branch rules
- [ ] Dependabot/Renovate tuning for the eslint/typedoc stack
- [ ] npm provenance badge after the first real publish
- [ ] Confirm Trusted Publisher binding after `npm:trust` on a renamed package
- [ ] Node matrix in CI if `engines.node` ever allows more than `.nvmrc` major `26`
- [ ] Remove `minimatch` override + TypeDoc patch when upstream supports minimatch >=11.0.1 (**retained, blocked on upstream**)
- [ ] Consumer clone dry-run checklist (rename → setup → feature → release dry-run)
- [ ] Org-level template defaults (topics, Pages `docs/`, default branch policy)
- [ ] Optional monorepo notes (out of scope until needed)

**Closed in this pass:** FUNDING.yml, CITATION.cff, DISCUSSION_TEMPLATE, tag helper, pack smoke in CI, dual `changelog/generate.mjs` removed, devenv helper tests, gate bypasses, package.json polish, operator checklist, README numbering.

## 🗺️ Layout

```text
.devenv/            Script library (prepare, setup, lib, tools, deps, utils)
.husky/             Git hooks (Husky)
.github/            Issues, PRs, workflows, labels, CONTRIBUTING, FUNDING, CITATION
configs/            ESLint, Prettier, Vitest, TypeDoc, tsconfig pieces
docs/               TypeDoc GitHub Pages site (tracked)
src/                Library source (`base/`, `types/`, package root)
tests/              Consumer, unit, and devenv helper tests
```

`docs/` is the TypeDoc GitHub Pages site. Regenerate with `npm run docify:typedoc` and commit when the public API changes.

## ⌨️ Key scripts

| Script                    | Purpose                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| `npm run setup`           | Git/Node checks, `npm clean-install` (runs `prepare`), then `check` |
| `npm run gh:label:sync`   | Sync `.github/labels.json` with `gh`                                |
| `npm run gh:setup`        | Ensure `gh` auth, then sync labels                                  |
| `npm run check`           | Typecheck, format, lint, layout, tests, build                       |
| `npm run npm:pack:smoke`  | Dry-run pack asserts `dist/` is in the publish tarball              |
| `npm run git:tag:version` | Create (and optionally `--push`) `v*` from `package.json` on `main` |
| `npm run docify:typedoc`  | Regenerate the Pages site into `docs/`                              |

The full script table and prepare/setup order live in [CONTRIBUTING](.github/CONTRIBUTING.md). Tutorials are in [HOW-TO](.github/HOW-TO.md).

## 🔗 Links

- [Contributing](.github/CONTRIBUTING.md)
- [How-to FAQ](.github/HOW-TO.md)
- [Support](.github/SUPPORT.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security](.github/SECURITY.md)
- [Citation](.github/CITATION.cff)
- [License](LICENSE)
