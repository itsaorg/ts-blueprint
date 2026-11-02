# How-to FAQ

Command-by-command guides for this repository. Reference details (script table, hooks, labels) stay in [CONTRIBUTING.md](CONTRIBUTING.md).

Use **`npm clean-install`** for lockfile installs (same command as the old `npm ci` alias). This repo uses the long name so install is not confused with continuous integration.

## 🗂️ Table of contents

- [How-to FAQ](#how-to-faq)
  - [🗂️ Table of contents](#️-table-of-contents)
  - [🖥️ What do I do before cloning?](#️-what-do-i-do-before-cloning)
  - [🌱 What do I do after cloning?](#-what-do-i-do-after-cloning)
  - [🔄 What does `npm prepare` run?](#-what-does-npm-prepare-run)
  - [🎫 When do I open which issue?](#-when-do-i-open-which-issue)
  - [📌 What do I do after the issue exists?](#-what-do-i-do-after-the-issue-exists)
  - [🌲 Which Git Flow branch type do I use?](#-which-git-flow-branch-type-do-i-use)
  - [💻 How do I work day to day on a topic branch?](#-how-do-i-work-day-to-day-on-a-topic-branch)
  - [✨ How do I finish a feature or bugfix?](#-how-do-i-finish-a-feature-or-bugfix)
  - [📦 How do I finish a release?](#-how-do-i-finish-a-release)
  - [🚑 How do I finish a hotfix?](#-how-do-i-finish-a-hotfix)
  - [🛟 When do I use a support branch?](#-when-do-i-use-a-support-branch)
  - [⏭️ How do I skip hooks once?](#️-how-do-i-skip-hooks-once)

## 🖥️ What do I do before cloning?

Install tools on your machine first. On Windows, use Git Bash.

```bash
git --version
```

```bash
node -v
```

```bash
npm -v
```

Node must match `.nvmrc` (this repo uses Node 26).

```bash
git flow version
```

If that fails and you will start topic branches with `git flow` or `.devenv/tools/git-flow/*`, install Git Flow AVH from the [AVH wiki](https://github.com/petervanderdoes/gitflow-avh/wiki/Installation), then re-run `git flow version`. Helpers print the same install guide when AVH is missing.

## 🌱 What do I do after cloning?

If this repository was created from the GitHub template, ensure **all branches** were included so `develop` exists on the remote (CI and Git Flow need it). If `develop` is missing:

```bash
git fetch origin
git checkout develop
git push -u origin develop
```

Then clone (or continue in an existing clone):

```bash
git clone <repository HTTPS URL>
```

```bash
cd <repository directory>
```

Prefer a lockfile install:

```bash
npm clean-install
```

That runs the `prepare` lifecycle (Husky, git commit template, gh/npm auth when possible, label sync). See [What does `npm prepare` run?](#-what-does-npm-prepare-run).

For machine probes, install, and the CI gate in one step:

```bash
npm run setup
```

Use `npm install` only when a maintainer asked you to refresh `package-lock.json`.

## 🔄 What does `npm prepare` run?

`prepare` runs after every `npm clean-install` / `npm install`. Order:

1. `husky:prepare` — install hooks under `.husky/`
2. `git:setup` — fail if git is missing; set local `commit.template`
3. `node:setup` — soft-check Node vs `.nvmrc` (else `engines.node`)
4. `gh:setup` — `gh` auth and exclusive label sync when allowed (skips in CI)
5. `npm:setup` — `npm whoami` / `npm login` on a TTY (skips in CI; never `npm:trust`)
6. `git-flow:setup` — soft-skip if missing; else ensure Git Flow init for `main`/`develop`

The sequence is idempotent. It does not run `npm clean-install`, `npm run check`, or Trusted Publishing setup.

## 🎫 When do I open which issue?

Blank issues are off. Use the GitHub chooser:

| Situation                                   | Template                                                         |
| ------------------------------------------- | ---------------------------------------------------------------- |
| Defect in published or in-progress behavior | Bug report                                                       |
| New or changed public contract              | Feature request                                                  |
| Tooling, docs, or maintenance               | Chore / docs                                                     |
| Vulnerability or conduct                    | Do **not** use public issues — follow [SECURITY.md](SECURITY.md) |

The template applies the type label. Maintainers set Status, Priority, and Git Flow labels.

## 📌 What do I do after the issue exists?

Note the issue number (for example `42`).

```bash
git checkout develop
```

```bash
git pull origin develop
```

```bash
node .devenv/tools/git-flow/feature/start.mjs 42-<slug>
```

Or the raw CLI: `git flow feature start 42-<slug>`. Use `bugfix`, `release`, `hotfix`, or `support` modules under `.devenv/tools/git-flow/` when that type matches. Replace `<slug>` with a short kebab-case phrase.

## 🌲 Which Git Flow branch type do I use?

| Type       | When                                   | Merges toward                                        |
| ---------- | -------------------------------------- | ---------------------------------------------------- |
| `feature/` | New work from an issue                 | `develop` via pull request                           |
| `bugfix/`  | Non-production defect while developing | `develop` via pull request                           |
| `release/` | Stabilize a version cut                | `main` (and keep `develop` current) via pull request |
| `hotfix/`  | Production fix on `main`               | `main`, then ensure `develop` gets the fix           |
| `support/` | Long-lived maintenance line            | That support line via pull request                   |
| `develop`  | Integration branch                     | Do not commit product work directly here             |
| `main`     | Production line                        | Do not commit product work directly here             |

Tags use the `v` prefix (for example `v0.1.0`).

## 💻 How do I work day to day on a topic branch?

Edit under `src/` (and tests). Commit with Conventional Commits.

```bash
git add -A
```

```bash
git commit
```

```bash
npm run check
```

```bash
git push -u origin HEAD
```

## ✨ How do I finish a feature or bugfix?

Use a **pull request**. Do **not** use `git flow feature finish` or `git flow bugfix finish` to merge locally — that bypasses GitHub review and CI.

```bash
node .devenv/tools/git-flow/feature/finish.mjs
```

That pushes the branch and runs `gh pr create --base develop --fill` when `gh` is authenticated. For bugfix:

```bash
node .devenv/tools/git-flow/bugfix/finish.mjs
```

Wait for the `ci` workflow. Merge on GitHub when green.

Then update local `develop` and delete the topic branch:

```bash
git checkout develop
```

```bash
git pull origin develop
```

```bash
git branch -d feature/<number>-<slug>
```

```bash
git push origin --delete feature/<number>-<slug>
```

Use `bugfix/` in those names when finishing a bugfix.

## 📦 How do I finish a release?

Release uses **Changesets for the version bump** and a **git tag to publish**. Feature/bugfix/chore PRs into `develop` should include a Changesets file when the published package should bump. Semver type follows API impact (not branch name): features are usually minor/major; bugfixes and chores are often patch.

```bash
git checkout develop
```

```bash
git pull origin develop
```

```bash
npm run changeset:status
```

```bash
node .devenv/tools/git-flow/release/start.mjs <x.y.z>
```

On `release/<x.y.z>` only (never on `develop` or `main`):

```bash
npm run changeset:version
```

Confirm `package.json` version matches the intended cut. Then PR-first finish into `main`:

```bash
node .devenv/tools/git-flow/release/finish.mjs
```

After the PR merges and CI is green on `main`, tag **exactly** the version in `package.json`:

```bash
git checkout main
```

```bash
git pull origin main
```

```bash
git tag "v$(node -p "require('./package.json').version")"
```

```bash
git push origin "v$(node -p "require('./package.json').version")"
```

Pushing the `v*` tag runs `.github/workflows/release.yml` (check → `npm:release` → GitHub Release).

**Mandatory:** open a second pull request from `main` into `develop` so integration stays current. Merge that PR before deleting the local/remote `release/` branch.

## 🚑 How do I finish a hotfix?

Hotfixes almost always use a **patch** Changeset. Start from `main`:

```bash
git checkout main
```

```bash
git pull origin main
```

```bash
node .devenv/tools/git-flow/hotfix/start.mjs <x.y.z>
```

Add a patch Changeset for the fix, then on the hotfix branch only:

```bash
npm run changeset:version
```

PR-first finish into `main`:

```bash
node .devenv/tools/git-flow/hotfix/finish.mjs
```

After merge and green CI on `main`, tag the `package.json` version and push the `v*` tag (same commands as release). `release.yml` publishes.

**Mandatory:** open a second PR from `main` into `develop` so the fix is not lost. Delete the hotfix branch only after both merges.

## 🛟 When do I use a support branch?

Use `support/<name>` for a long-lived maintenance line that must stay separate from current `develop` work. Start it from the appropriate base commit, open PRs **into that support branch**, and do not mix unrelated `develop` features onto it.

```bash
node .devenv/tools/git-flow/support/start.mjs <name> <base>
```

## ⏭️ How do I skip hooks once?

Only with maintainer agreement:

```bash
HUSKY=0 git commit -m "docs: note a local exception"
```

```bash
HUSKY=0 git push
```
