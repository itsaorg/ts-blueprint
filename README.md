# @itsaorg/ts-blueprint

Itsa TypeScript library blueprint and **GitHub template** for all platform repositories.

The toolchain (`.devenv/`, configs, hooks, and GitHub community files) was copied from `@itsaorg/storage-base` and retargeted to this blueprint. Part 1 records how that baseline was built. Part 2 is the guide for anyone creating a library from this template.

---

## ⫶☰ Table Of Contents

- [@itsaorg/ts-blueprint](#itsaorgts-blueprint)
  - [⫶☰ Table Of Contents](#-table-of-contents)
  - [Verified toolchain baseline](#verified-toolchain-baseline)
  - [Part 1 — How we built this template repository](#part-1--how-we-built-this-template-repository)
    - [P1.0 Prerequisites](#p10-prerequisites)
      - [P1.0.1 — Install Git](#p101--install-git)
      - [P1.0.2 — Install Node.js 26](#p102--install-nodejs-26)
      - [P1.0.3 — Install git-flow AVH](#p103--install-git-flow-avh)
    - [P1.1 GitHub — org and base repo](#p11-github--org-and-base-repo)
    - [P1.2 GitHub — template readiness](#p12-github--template-readiness)
      - [P1.2.1 — Issue and PR templates](#p121--issue-and-pr-templates)
      - [P1.2.2 — CI workflow](#p122--ci-workflow)
      - [P1.2.3 — Publish workflow](#p123--publish-workflow)
      - [P1.2.4 — Branch protection (after first push)](#p124--branch-protection-after-first-push)
    - [P1.3 Git — local init and git-flow](#p13-git--local-init-and-git-flow)
    - [P1.4 npm — package foundation](#p14-npm--package-foundation)
    - [P1.5 TypeScript](#p15-typescript)
    - [P1.6 ESLint and Prettier](#p16-eslint-and-prettier)
    - [P1.7 Vitest](#p17-vitest)
    - [P1.8 Husky and Commitlint](#p18-husky-and-commitlint)
    - [P1.9 Changesets and CHANGELOG](#p19-changesets-and-changelog)
    - [P1.10 TypeDoc](#p110-typedoc)
    - [P1.11 Quality gate scripts](#p111-quality-gate-scripts)
    - [P1.12 npmjs — org and Trusted Publisher](#p112-npmjs--org-and-trusted-publisher)
      - [P1.12.1 — npm account and org access](#p1121--npm-account-and-org-access)
      - [P1.12.2 — Trusted Publisher (recommended)](#p1122--trusted-publisher-recommended)
      - [P1.12.3 — GitHub repository secret (fallback)](#p1123--github-repository-secret-fallback)
      - [P1.12.4 — Publish flow](#p1124--publish-flow)
    - [P1.13 Final verification](#p113-final-verification)
    - [P1.14 Enable template repository](#p114-enable-template-repository)
  - [Part 2 — How to use this template for your repository](#part-2--how-to-use-this-template-for-your-repository)
    - [P2.0 Prerequisites](#p20-prerequisites)
    - [P2.1 GitHub — create from template](#p21-github--create-from-template)
      - [Step 1 — Open the blueprint repository](#step-1--open-the-blueprint-repository)
      - [Step 2 — Click Use this template](#step-2--click-use-this-template)
      - [Step 3 — Choose Create a new repository](#step-3--choose-create-a-new-repository)
      - [Step 4 — Configure owner, name, and visibility](#step-4--configure-owner-name-and-visibility)
      - [Step 5 — Confirm the new repository](#step-5--confirm-the-new-repository)
    - [P2.2 Clone and install](#p22-clone-and-install)
    - [P2.3 Manual rename checklist](#p23-manual-rename-checklist)
    - [P2.4 Git and GitHub configuration](#p24-git-and-github-configuration)
      - [P2.4.1 — Initialize git-flow (if not already configured)](#p241--initialize-git-flow-if-not-already-configured)
      - [P2.4.2 — Ensure develop exists on GitHub](#p242--ensure-develop-exists-on-github)
      - [P2.4.3 — Branch protection (GitHub web UI)](#p243--branch-protection-github-web-ui)
    - [P2.5 npmjs setup (if publishing)](#p25-npmjs-setup-if-publishing)
      - [P2.5.1 — npm login and org access](#p251--npm-login-and-org-access)
      - [P2.5.2 — Trusted Publisher for your repo](#p252--trusted-publisher-for-your-repo)
      - [P2.5.3 — First publish checklist](#p253--first-publish-checklist)
    - [P2.6 Verify each tool](#p26-verify-each-tool)
    - [P2.7 Full quality gate](#p27-full-quality-gate)
    - [P2.8 Repository layout reference](#p28-repository-layout-reference)
  - [License](#license)

---

## Verified toolchain baseline

These versions were verified on **Windows Git Bash (MINGW64)**. Install at least these versions before starting either part.

| Tool         | Verified version              | Minimum       | Verify command     | Pass condition                       |
| ------------ | ----------------------------- | ------------- | ------------------ | ------------------------------------ |
| Node.js      | **v26**                       | >= 26         | `node -v`          | Prints `v26` or newer                |
| npm          | **11.9.0**                    | >= 11.9.0     | `npm -v`           | Prints `11.9.0` or newer             |
| Git          | **2.55.0.windows.5**          | >= 2.55.0     | `git -v`           | Prints `git version 2.55.0` or newer |
| git-flow AVH | **1.12.4-dev0 (AVH Edition)** | AVH installed | `git flow version` | Reports AVH Edition                  |

> **Windows notes**
>
> - Use **Git Bash** (bundled with [Git for Windows](https://git-scm.com/download/win)).
> - Install Node via [nodejs.org](https://nodejs.org/), [nvm-windows](https://github.com/coreybutler/nvm-windows), or [fnm](https://github.com/Schniz/fnm).
> - Install git-flow AVH: [git-flow AVH](https://github.com/petervanderdoes/gitflow-avh/wiki/Installation).
>
> **Not required:** GitHub CLI (`gh`). All GitHub and npm Trusted Publisher steps in this guide use the **web UI**.
>
> **Docs output:** TypeDoc API output goes to `docs/` (gitignored). Do not commit generated docs.

---

## Part 1 — How we built this template repository

**Audience:** Maintainer rebuilding `itsaorg/ts-blueprint` from an empty repository.

**Goal:** After completing every step below, this repo contains the full TypeScript library toolchain, CI/CD, npm publish pipeline, and is ready to enable as a GitHub template.

Each step follows: **Goal → Action → Verify → Expected output**.

---

### P1.0 Prerequisites

Install and verify every machine tool before creating the repository.

#### P1.0.1 — Install Git

**Action:** Install [Git for Windows](https://git-scm.com/install/windows). Open Git Bash.

**Verify:**

```bash
git -v
```

**Expected output:**

```text
git version 2.55.0.windows.5
```

(or newer)

#### P1.0.2 — Install Node.js 26

**Action:** Install Node **26**. Create `.nvmrc` at repo root with content `26`.

**Verify:**

```bash
node -v
npm -v
```

**Expected output:**

```text
v26
11.9.0
```

#### P1.0.3 — Install git-flow AVH

**Action:** Install [git-flow AVH](https://github.com/petervanderdoes/gitflow-avh/wiki/Installation).

**Verify:**

```bash
git flow version
```

**Expected output:**

```text
1.12.4-dev0 (AVH Edition)
```

---

### P1.1 GitHub — org and base repo

**Goal:** Create the empty GitHub repository under the `itsaorg` organization.

**Action (GitHub web UI):**

1. Sign in to GitHub and open the `itsaorg` organization.
2. Click **New repository**.
3. Set **Repository name** to `ts-blueprint`.
4. Set visibility (public recommended for a template).
5. Do **not** add a README, `.gitignore`, or license on GitHub — you will push these from local.
6. Click **Create repository**.

**Verify:** Repository exists at `https://github.com/itsaorg/ts-blueprint`.

**Screenshot path (add when captured):** `assets/readme/part1/github/01-create-repo.png`

---

### P1.2 GitHub — template readiness

**Goal:** Prepare GitHub settings, issue/PR templates, and CI workflows. Enable the **Template repository** flag only after Part 1 is complete (see [P1.14](#p114-enable-template-repository)).

#### P1.2.1 — Issue and PR templates

Create these files locally (commit in later steps):

- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`

**Verify:** After push, **New issue** on GitHub shows the templates.

#### P1.2.2 — CI workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  check:
    name: check (Node 26)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "26"
          cache: npm
      - run: npm ci
      - run: npm run check
```

#### P1.2.3 — Publish workflow

Create `.github/workflows/publish.yml` with:

- Trigger on push to `main` and `workflow_dispatch`
- Node 26, `npm ci --ignore-scripts`, `npm run build`
- [Changesets Action](https://github.com/changesets/action) for version bumps and staged publish
- `permissions.id-token: write` for npm Trusted Publisher (OIDC)
- `NPM_TOKEN` secret for fallback publish paths

#### P1.2.4 — Branch protection (after first push)

**Action (GitHub web UI):**

1. **Settings → Branches → Add branch ruleset** (or classic protection).
2. Protect `main` and `develop`:
   - Require pull request before merging
   - Require status check: `check (Node 26)`
   - Do not allow force pushes

**Verify:** Direct push to `main` is rejected; PR with green CI can merge.

**Screenshot path:** `assets/readme/part1/github/02-branch-protection.png`

---

### P1.3 Git — local init and git-flow

**Goal:** Initialize local repo, seed files, and git-flow branches.

**Action:**

```bash
mkdir ts-blueprint && cd ts-blueprint
git init
git flow init -d
```

Accept defaults: `main` as production, `develop` as integration.

Create seed files:

- `LICENSE` — Apache-2.0
- `.gitignore` — minimal entries (see bottom of this README's seed section)
- `README.md` — this guide

**First commit and push:**

```bash
git add .
git commit -m "chore: seed repository with setup guide"
git remote add origin git@github.com:itsaorg/ts-blueprint.git
git push -u origin main
git push -u origin develop
```

**Verify:**

```bash
git branch -a
git flow version
```

**Expected:** `main` and `develop` exist locally and on GitHub.

---

### P1.4 npm — package foundation

**Goal:** Create `package.json` for a scoped public library.

**Action:**

```bash
npm init -y
```

Edit `package.json` key fields:

| Field                      | Value                                                       |
| -------------------------- | ----------------------------------------------------------- |
| `name`                     | `@itsaorg/ts-blueprint`                                     |
| `version`                  | `1.0.0`                                                     |
| `description`              | Itsa TypeScript library blueprint and GitHub template       |
| `type`                     | `module`                                                    |
| `license`                  | `Apache-2.0`                                                |
| `engines.node`             | `>=26`                                                      |
| `exports["."].types`       | `./types/index.d.ts`                                        |
| `exports["."].import`      | `./dist/index.js`                                           |
| `files`                    | `["dist", "types", "LICENSE", "README.md", "CHANGELOG.md"]` |
| `repository.url`           | `git+https://github.com/itsaorg/ts-blueprint.git`           |
| `publishConfig.access`     | `public`                                                    |
| `publishConfig.provenance` | `true`                                                      |

Add script skeleton (filled in as tools are added):

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "prepare": "husky",
    "prepublishOnly": "npm run build"
  }
}
```

Create root `tsconfig.json` that extends config:

```json
{
  "extends": "./config/tsconfig.json"
}
```

**Verify:**

```bash
npm pkg get name engines
```

**Expected:** `@itsaorg/ts-blueprint` and `>=26`.

---

### P1.5 TypeScript

**Goal:** Source in `src/`, compiled JS in `dist/`, declarations in `types/`.

**Action:**

1. Create `config/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "rootDir": "../src",
    "outDir": "../dist",
    "declarationDir": "../types",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["../src/**/*.ts"],
  "exclude": ["../node_modules", "../dist", "../types", "../tests"]
}
```

1. Create `src/index.ts` with a sample export (e.g. `getBlueprintHealth()` returning `{ status: 'ok', package: '@itsaorg/ts-blueprint' }`).

2. Create placeholder `types/index.d.ts` (regenerated by build; keep a minimal stub for editor support before first build).

3. Add to `.gitignore`: `dist/`, and `/types/*` with exceptions for `types/index.d.ts` and `types/README.md` if you add a types folder readme.

4. Install TypeScript:

```bash
npm install -D typescript@^5.7.2
```

**Verify:**

```bash
npm run build
ls dist/ types/
```

**Expected:** `dist/index.js` and `types/index.d.ts` exist.

---

### P1.6 ESLint and Prettier

**Goal:** Lint and format with configs under `config/`.

**Action:**

```bash
npm install -D eslint@^9.17.0 @eslint/js@^9.17.0 typescript-eslint@^8.18.2 eslint-config-prettier@^9.1.0 prettier@^3.4.2 lint-staged@^15.2.11
```

Create:

- `config/eslint.config.js` — flat config for TypeScript
- `config/.prettierrc.json`
- `config/.prettierignore`

Add scripts:

```json
"lint": "eslint . --config config/eslint.config.js",
"lint:fix": "eslint . --fix --config config/eslint.config.js",
"format": "prettier --write . --config config/.prettierrc.json --ignore-path config/.prettierignore",
"format:check": "prettier --check . --config config/.prettierrc.json --ignore-path config/.prettierignore"
```

Add `lint-staged` section to `package.json` (runs via Husky in P1.8).

**Verify:**

```bash
npm run lint
npm run format:check
```

---

### P1.7 Vitest

**Goal:** Unit tests, coverage gate, and consumer import smoke test.

**Action:**

```bash
npm install -D vitest@^2.1.8 @vitest/coverage-v8@^2.1.8 @types/node@^22.10.2
```

Create:

- `config/vitest.config.ts` — unit tests under `tests/`
- `config/vitest.consumer.config.ts` — imports built package like a consumer
- `tests/index.test.ts` — basic test for `getBlueprintHealth`

Add scripts:

```json
"test": "vitest run -c config/vitest.config.ts",
"test:coverage": "vitest run --coverage -c config/vitest.config.ts",
"test:consumer": "vitest run -c config/vitest.consumer.config.ts"
```

**Verify:**

```bash
npm run test:coverage
npm run build && npm run test:consumer
```

---

### P1.8 Husky and Commitlint

**Goal:** Enforce staged lint/format, conventional commits, and pre-push quality gate.

**Action:**

```bash
npm install -D husky@^9.1.7 @commitlint/cli@^19.6.1 @commitlint/config-conventional@^19.6.0
npx husky init
```

Configure hooks:

| Hook                | Content                                     |
| ------------------- | ------------------------------------------- |
| `.husky/pre-commit` | Staged file limit check + `npx lint-staged` |
| `.husky/commit-msg` | `npx --no -- commitlint --edit $1`          |
| `.husky/pre-push`   | `npm run check`                             |

Create `config/commitlint.config.js` extending `@commitlint/config-conventional`.

Ensure `"prepare": "husky"` is in `package.json` scripts.

**Verify:**

```bash
npm install
# stage a file and commit with a valid message: feat: test husky
# try bad message: should fail commitlint
```

---

### P1.9 Changesets and CHANGELOG

**Goal:** Semantic versioning and automated changelog.

**Action:**

```bash
npm install -D @changesets/cli@^2.27.10
npx changeset init
```

Edit `.changeset/config.json`:

- `"access": "public"`
- `"baseBranch": "develop"`
- `"fixed": [["@itsaorg/*"]]` if using org-wide fixed versioning

Create `CHANGELOG.md` (updated by `changeset version`).

Add scripts:

```json
"changeset": "changeset",
"changeset:version": "changeset version",
"changeset:publish": "changeset publish"
```

**Verify:**

```bash
npx changeset --empty
```

Creates a changeset file under `.changeset/`.

---

### P1.10 TypeDoc

**Goal:** Generate API reference to **`docs/api/` only** — not under `assets/readme/`.

**Why:** TypeDoc output is generated and gitignored. README screenshots are static and committed under `assets/readme/`. Keeping them separate prevents accidental overwrites if TypeDoc `out` path changes.

**Action:**

```bash
npm install -D typedoc@^0.27.5
```

Create `config/typedoc.json`:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["../src/index.ts"],
  "out": "../docs/api",
  "readme": "none",
  "excludePrivate": true,
  "excludeInternal": true
}
```

Add to `.gitignore`: `docs/api/`

Add script: `"docs": "typedoc --options config/typedoc.json"`

**Verify:**

```bash
npm run docs
ls docs/api/
```

**Expected:** HTML API docs in `docs/api/`; `assets/readme/` unchanged.

---

### P1.11 Quality gate scripts

**Goal:** Composite `npm run check` matching CI and Husky pre-push.

**Action:** Create scripts under `scripts/`:

| Script                        | Purpose                                    |
| ----------------------------- | ------------------------------------------ |
| `check-layout.mjs`            | Validates `src/`, `dist/`, `types/` layout |
| `check-types-mirror.mjs`      | Ensures `types/` mirrors public API        |
| `check-tarball.mjs`           | Validates npm pack contents                |
| `check-staged-file-limit.mjs` | Pre-commit staged file cap                 |
| `clean.mjs`                   | Removes `dist/`, `coverage/`, `docs/api/`  |
| `stage-publish.mjs`           | Staged npm publish for Changesets Action   |

Add scripts:

```json
"check:layout": "node scripts/check-layout.mjs",
"check:types-mirror": "node scripts/check-types-mirror.mjs",
"check:tarball": "node scripts/check-tarball.mjs",
"check": "npm run lint && npm run format:check && npm run typecheck && npm run test:coverage && npm run build && npm run check:layout && npm run check:types-mirror && npm run test:consumer && npm run check:tarball",
"clean": "node scripts/clean.mjs",
"changeset:stage": "node scripts/stage-publish.mjs"
```

**Verify:**

```bash
npm run check
```

All steps must pass locally before pushing.

---

### P1.12 npmjs — org and Trusted Publisher

**Goal:** Publish `@itsaorg/ts-blueprint` to npm with provenance via GitHub Actions OIDC.

#### P1.12.1 — npm account and org access

**Action (npmjs.com web UI):**

1. Create or sign in to your npm account.
2. Confirm membership in the `@itsaorg` organization with publish rights.

**Verify:**

```bash
npm whoami
```

#### P1.12.2 — Trusted Publisher (recommended)

**Action (npmjs.com web UI):**

1. Open package `@itsaorg/ts-blueprint` (or create on first publish).
2. Go to **Settings → Trusted Publisher**.
3. Link **GitHub Actions**:
   - Organization: `itsaorg`
   - Repository: `ts-blueprint`
   - Workflow: `publish.yml` (or your publish workflow filename)
   - Environment: (leave blank unless using GitHub Environments)

**Verify:** Trusted Publisher shows as configured for the repo.

**Screenshot path:** `assets/readme/part1/npmjs/01-trusted-publisher.png`

#### P1.12.3 — GitHub repository secret (fallback)

**Action (GitHub web UI):**

1. **Settings → Secrets and variables → Actions**.
2. Add `NPM_TOKEN` — automation token with publish access to `@itsaorg`.

#### P1.12.4 — Publish flow

**Action:**

1. On a feature branch: `npx changeset` → describe change → commit changeset file.
2. Open PR to `develop`, merge after CI passes.
3. Merge `develop` → `main` via PR.
4. Publish workflow runs Changesets Action: version bump, changelog update, npm publish with provenance.

**Verify:** Package appears at `https://www.npmjs.com/package/@itsaorg/ts-blueprint` with provenance badge.

---

### P1.13 Final verification

**Goal:** Confirm the rebuilt repo is production-ready.

**Checklist:**

- [ ] `npm run check` passes locally
- [ ] CI green on `develop` and `main`
- [ ] Husky hooks work (pre-commit, commit-msg, pre-push)
- [ ] `npm run docs` generates `docs/api/` without touching `assets/readme/`
- [ ] Create a **throwaway test repo** via **Use this template** (after P1.14) and confirm clone + `npm install` + `npm run check` work

---

### P1.14 Enable template repository

**Goal:** Allow others to create repos from this blueprint.

**Action (GitHub web UI):**

1. Open `https://github.com/itsaorg/ts-blueprint`.
2. **Settings → General**.
3. Check **Template repository**.
4. Save.

**Verify:** Green **Use this template** button appears on the repo page.

**What template users receive:** Everything committed on `main` — source, configs, CI workflows, Husky hooks, Changesets, and this README (Part 2 guides them from there).

When Part 1 is complete, this repo matches what Part 2 assumes.

---

## Part 2 — How to use this template for your repository

**Audience:** Developer creating a new TypeScript library from **Use this template** on GitHub.

**Prerequisite:** Part 1 must be complete on `itsaorg/ts-blueprint` so the template includes the full toolchain. Tool verification sections (P2.6–P2.7) require that tooling in your new repo.

**Single path:** GitHub web **Use this template** only. No CLI scaffolding, no overlay folders, no token substitution scripts.

---

### P2.0 Prerequisites

Install the same machine tools as [Verified toolchain baseline](#verified-toolchain-baseline).

**Verify before continuing:**

```bash
node -v    # v26 or newer
npm -v     # 11.9.0 or newer
git -v     # git version 2.55.0 or newer
git flow version   # AVH Edition
```

---

### P2.1 GitHub — create from template

**Goal:** Create your own repository from the blueprint.

#### Step 1 — Open the blueprint repository

Go to: `https://github.com/itsaorg/ts-blueprint`

![Step 1 — Open itsaorg/ts-blueprint](assets/readme/part2/github-template/step-01-open-repo.png)

#### Step 2 — Click Use this template

Click the green **Use this template** button (not **Fork**).

![Step 2 — Use this template button](assets/readme/part2/github-template/step-02-use-template-button.png)

#### Step 3 — Choose Create a new repository

Select **Create a new repository** from the dropdown.

![Step 3 — Create a new repository](assets/readme/part2/github-template/step-03-create-dialog.png)

#### Step 4 — Configure owner, name, and visibility

| Field           | Example                      |
| --------------- | ---------------------------- |
| Owner           | `itsaorg` (or your org/user) |
| Repository name | `my-library`                 |
| Visibility      | Public or Private            |

Click **Create repository**.

![Step 4 — Owner, name, visibility](assets/readme/part2/github-template/step-04-owner-name-visibility.png)

#### Step 5 — Confirm the new repository

You should land on your new repo's home page with a **Code** button.

![Step 5 — New repository landing page](assets/readme/part2/github-template/step-05-create-repository.png)

**Verify:** URL is `https://github.com/<owner>/<your-repo>` — not a fork of ts-blueprint.

---

### P2.2 Clone and install

**Goal:** Local development environment with correct Node version and dependencies.

**Action:**

```bash
git clone git@github.com:<owner>/<your-repo>.git
cd <your-repo>
nvm use
node -v
npm -v
npm install
```

If you use fnm: `fnm use` instead of `nvm use` (reads `.nvmrc`).

**Expected:**

- `npm install` completes without errors
- Husky `prepare` script installs git hooks (see `.husky/` directory)

![Step 6 — Clone and verify](assets/readme/part2/github-template/step-06-clone-and-verify.png)

**Verify:**

```bash
npm run typecheck
```

---

### P2.3 Manual rename checklist

**Goal:** Replace blueprint identifiers with your package name.

There is no automatic token substitution. Edit these files manually:

| File                     | What to change                                          |
| ------------------------ | ------------------------------------------------------- |
| `package.json`           | `name`, `description`, `repository`, `bugs`, `homepage` |
| `README.md`              | Title, clone URL, package name references               |
| `src/index.ts`           | Hardcoded package string in exports (if present)        |
| `types/index.d.ts`       | Package name in placeholder declarations                |
| `.changeset/config.json` | `fixed` group if your npm scope differs                 |

**Worked example:** `@itsaorg/ts-blueprint` → `@itsaorg/my-library`, repo `ts-blueprint` → `my-library`.

**Verify:**

```bash
npm pkg get name
grep -r "ts-blueprint" src/ README.md || echo "No stale references"
```

**Screenshot path (add when captured):** `assets/readme/part2/rename-config/01-manual-rename-checklist.png`

---

### P2.4 Git and GitHub configuration

**Goal:** git-flow branches, remote tracking, and branch protection.

#### P2.4.1 — Initialize git-flow (if not already configured)

```bash
git flow init -d
```

#### P2.4.2 — Ensure develop exists on GitHub

```bash
git checkout develop
git push -u origin develop
```

#### P2.4.3 — Branch protection (GitHub web UI)

1. **Settings → Branches**.
2. Protect `main` and `develop`:
   - Require pull request
   - Require status check: `check (Node 26)`
   - Block force pushes

**Verify:** Issue and PR templates appear under **New issue** and when opening a PR.

**Screenshot path:** `assets/readme/part2/rename-config/02-branch-protection.png`

---

### P2.5 npmjs setup (if publishing)

**Goal:** Publish your scoped package under your org with Trusted Publisher.

Skip this section if you are not publishing to npm.

#### P2.5.1 — npm login and org access

```bash
npm login
npm whoami
```

Confirm you can publish to your scope (e.g. `@itsaorg`).

#### P2.5.2 — Trusted Publisher for your repo

**Action (npmjs.com web UI):**

1. Open your package on npm (or prepare for first publish).
2. **Settings → Trusted Publisher → GitHub Actions**.
3. Link **your** repository (not `ts-blueprint`):
   - Organization / user: your owner
   - Repository: `<your-repo>`
   - Workflow: `publish.yml`

**Verify:** Trusted Publisher entry matches your repo.

**Screenshot path:** `assets/readme/part2/npmjs/01-trusted-publisher.png`

#### P2.5.3 — First publish checklist

- [ ] `package.json` `name` is your scoped package
- [ ] `publishConfig.provenance: true`
- [ ] `NPM_TOKEN` secret set in **your** GitHub repo (Settings → Secrets)
- [ ] Changeset added: `npx changeset`
- [ ] PR merged to `main`; publish workflow completes

**Dry-run (optional):**

```bash
npm run build
npm pack --dry-run
```

---

### P2.6 Verify each tool

**Goal:** Confirm every tool in the quality pipeline works in your repo.

Run each command in order (matches `npm run check`):

| #   | Tool                 | Command                                | Config                             |
| --- | -------------------- | -------------------------------------- | ---------------------------------- |
| 1   | ESLint               | `npm run lint`                         | `config/eslint.config.js`          |
| 2   | Prettier             | `npm run format:check`                 | `config/.prettierrc.json`          |
| 3   | TypeScript           | `npm run typecheck`                    | `config/tsconfig.json`             |
| 4   | Vitest + coverage    | `npm run test:coverage`                | `config/vitest.config.ts`          |
| 5   | Build                | `npm run build`                        | `src/` → `dist/` + `types/`        |
| 6   | Layout check         | `npm run check:layout`                 | `scripts/check-layout.mjs`         |
| 7   | Types mirror         | `npm run check:types-mirror`           | `scripts/check-types-mirror.mjs`   |
| 8   | Consumer import      | `npm run test:consumer`                | `config/vitest.consumer.config.ts` |
| 9   | Tarball inspect      | `npm run check:tarball`                | `scripts/check-tarball.mjs`        |
| 10  | Husky pre-commit     | Stage a file, commit                   | `.husky/pre-commit`                |
| 11  | Commitlint           | Try invalid commit message             | `.husky/commit-msg`                |
| 12  | Conventional Commits | Use `feat:`, `fix:`, `chore:` prefixes | `config/commitlint.config.js`      |
| 13  | Changesets           | `npx changeset`                        | `.changeset/`                      |
| 14  | CHANGELOG            | Updated by `changeset version`         | `CHANGELOG.md`                     |
| 15  | TypeDoc              | `npm run docs` → output in `docs/api/` | `config/typedoc.json`              |
| 16  | GitHub Actions CI    | Push branch, confirm green check       | `.github/workflows/ci.yml`         |

**Screenshot paths (add as captured):** `assets/readme/part2/tools/01-eslint-pass.png` through `16-github-actions-ci.png`

---

### P2.7 Full quality gate

**Goal:** One command validates everything locally — same gate as CI and Husky pre-push.

```bash
npm run check
```

**Expected:** All steps pass with exit code 0.

This runs: lint → format check → typecheck → test coverage → build → layout → types mirror → consumer test → tarball check.

**Screenshot path:** `assets/readme/part2/tools/17-npm-run-check-pass.png`

---

### P2.8 Repository layout reference

**Goal:** Understand where source, types, and build output live.

```text
src/     → TypeScript source you write (.ts implementations)
types/   → Public type declarations (.d.ts) — placeholder before build, regenerated by npm run build
dist/    → Compiled JavaScript output (generated, not committed)
docs/api/ → TypeDoc API reference (generated, gitignored — not README images)
assets/readme/ → Static README screenshots (committed, never overwritten by TypeDoc)
```

TypeScript compiler paths (in `config/tsconfig.json`):

- `rootDir`: `../src`
- `outDir`: `../dist`
- `declarationDir`: `../types`

**You author types in `src/`** via TypeScript; **`types/` is the published declaration mirror** consumed by npm consumers through `package.json` `exports`.

**Diagram path (add when captured):** `assets/readme/part2/layout/src-types-dist-flow.png`

---

## License

Apache-2.0 — see [LICENSE](LICENSE).
