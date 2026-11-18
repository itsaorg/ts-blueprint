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
  - [🧭 Who owns Start / Publish / Finish?](#-who-owns-start--publish--finish)
  - [🤖 Where do Dependabot PRs land?](#-where-do-dependabot-prs-land)
  - [🌲 Which Git Flow branch type do I use?](#-which-git-flow-branch-type-do-i-use)
  - [💻 How do I work day to day on a topic branch?](#-how-do-i-work-day-to-day-on-a-topic-branch)
  - [🚀 How do I publish a feature or bugfix (open the PR)?](#-how-do-i-publish-a-feature-or-bugfix-open-the-pr)
  - [✨ How do I finish a feature or bugfix?](#-how-do-i-finish-a-feature-or-bugfix)
  - [📦 How do I cut a release?](#-how-do-i-cut-a-release)
  - [🚑 How do I finish a hotfix?](#-how-do-i-finish-a-hotfix)
  - [🛟 When do I use a support branch?](#-when-do-i-use-a-support-branch)
  - [📝 What is `changeset:add` vs `CHANGELOG.md`?](#-what-is-changesetadd-vs-changelogmd)
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
6. `gf:setup` — soft-skip if missing; else ensure Git Flow init for `main`/`develop`

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

Feature and bugfix **start** resolve the issue **before** naming the branch (GitHub assigns numbers only at create time).

On a TTY with no args, start lists open issues and asks you to pick one, or choose **0** to create. Create seeds `.git/ISSUE_EDITMSG` from the form that matches the typed command (`gf:feature:start` → Feature request, `gf:bugfix:start` → Bug report, release/hotfix/support → Chore or docs) with no form chooser; the raw issue-gate CLI still offers the 1/2/3 picker when no type is set. After the editor closes, `gh issue create` applies the form’s YAML labels plus the matching Git Flow label (for feature: `✨ Feature Request` and `🌟 Git Flow: Feature`). On a TTY you can add extra labels; defaults are never removed. Publish applies the same Git Flow default when it creates a PR. The branch name becomes `<number>-<slug>` from the created or chosen issue title. Pass an existing `<number>-<slug>` to skip the picker. Non-interactive shells require that explicit name.

```bash
git checkout develop
```

```bash
git pull origin develop
```

```bash
npm run gf:feature:start
```

```bash
npm run gf:feature:start -- 42-add-login
```

Prefer the npm script over raw `git flow feature start` so the issue gate runs. Use `bugfix` the same way. **Every** type start resolves an issue (picker/create or `--issue <n>`), requires a clean working tree, and (for feature/bugfix/release) a fully synced `develop`, or (hotfix) a synced `main`. Release/hotfix/support keep semver/support names and store `#N` in `.git/CURRENT_ISSUE` for publish/finish.

## 🧭 Who owns Start / Publish / Finish?

| Script      | Owns                                                     | Does not own                   |
| ----------- | -------------------------------------------------------- | ------------------------------ |
| **Start**   | Issue pick/create; clean synced base; branch create      | Push, PRs, merge               |
| **Publish** | Changeset gate; push; PR pick/create (`.git/PR_EDITMSG`) | Merge, branch delete           |
| **Finish**  | PR resolve; CI; approve gate; `gh pr merge`; cleanup     | Creating issues or opening PRs |

## 🤖 Where do Dependabot PRs land?

Dependabot opens version-update PRs against **`develop`** (see `.github/dependabot.yml` `target-branch`). Merge them like other integration work, then cut a release so bumps reach `main`. Do not retarget Dependabot to `main`.

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

Edit under `src/` (and tests). Commit with Conventional Commits. When the published package should bump, add a pending Changeset on the topic branch (not on `main`, `develop`, or `release/*`). You can run `npm run changeset:add`, or let **publish** guide a canonical pending file (`@changesets/write` / human-id name). On a feature branch, publish prompts **minor** or **major** plus a summary; bugfix/hotfix/support guided writes use **patch**.

```bash
npm run changeset:add
```

```bash
git add -A
```

```bash
git commit
```

```bash
npm run check
```

## 🚀 How do I publish a feature or bugfix (open the PR)?

**Publish** pushes and opens/selects the pull request. **Finish** owns approve/CI/merge and cleanup. Do **not** use `git flow feature finish` / `git flow bugfix finish` — that merges locally and skips CI.

Publish requires at least one pending `.changeset/*.md` file (or a release/hotfix version already applied). For chore/docs or an empty support line with no package bump, bypass with a flag or confirm on a TTY:

```bash
npm run gf:feature:publish
```

```bash
npm run gf:feature:publish -- --allow-no-changeset
```

That runs the pending-changeset gate, pushes, then either picks an existing open PR for this head (or `--pr <n>`) or opens `.git/PR_EDITMSG` (seeded from the PR template, with `Closes #N` from the branch name or `.git/CURRENT_ISSUE`). Fill **Summary** in the editor; empty Summary aborts create. Non-interactive shells must pass `--body-file <path>`:

```bash
npm run gf:feature:publish -- --allow-no-changeset --body-file ./pr-body.md
```

If `gh pr edit` fails with a Projects (classic) / `projectCards` GraphQL error, update title/body with REST `gh api …/pulls/N -X PATCH`. For bugfix:

```bash
npm run gf:bugfix:publish
```

## ✨ How do I finish a feature or bugfix?

Stay on the topic branch. Finish requires a clean tree and a published remote branch, resolves the PR (pick / `--pr`), requires CI green + approving review + issue link when known, then **merges** with a merge commit by default (full history). On a TTY you can pick squash; `--merge` / `--squash` skip the prompt. Then it deletes the topic branch and checks out the base. Solo maintainers:

```bash
npm run gf:feature:finish -- --allow-unapproved --merge
```

```bash
npm run gf:feature:finish -- --allow-unapproved --pr 25 --merge
```

```bash
npm run gf:bugfix:finish
```

## 📦 How do I cut a release?

Release uses **Changesets for the version bump** and a **git tag to publish**. Feature/bugfix PRs into `develop` should include a Changesets file when the published package should bump. Semver type follows API impact (not branch name): features are usually minor/major; bugfixes and chores are often patch.

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
npm run gf:release:start -- <x.y.z>
```

On `release/<x.y.z>` only (never on `develop` or `main`):

```bash
npm run changeset:version
```

Confirm `package.json` version matches the branch name. Publish opens the PR into `main` (pending files **or** version already applied):

```bash
npm run gf:release:publish
```

After review + merge on GitHub:

```bash
npm run gf:release:finish
```

Finish refuses leftover pending changesets and requires `package.json` version to match `release/<x.y.z>`. Then on `main`, tag **exactly** the version in `package.json`:

```bash
git checkout main
```

```bash
git pull origin main
```

```bash
npm run git:tag:version -- --push
```

Pushing the `v*` tag runs `.github/workflows/release.yml` (check → `npm:release` → GitHub Release). Equivalent raw commands: `git tag -a "v$(node -p "require('./package.json').version")" -m "…"` then `git push origin "v…"`.

**Mandatory:** open a second pull request from `main` into `develop` so integration stays current.

## 🚑 How do I finish a hotfix?

Hotfixes almost always use a **patch** Changeset. Start from `main`:

```bash
git checkout main
```

```bash
git pull origin main
```

```bash
npm run gf:hotfix:start -- <x.y.z>
```

```bash
npm run changeset:add
```

```bash
npm run changeset:version
```

```bash
npm run gf:hotfix:publish
```

After review + merge on GitHub:

```bash
npm run gf:hotfix:finish
```

After green CI on `main`, tag with `npm run git:tag:version -- --push` (same as release). `release.yml` publishes.

**Mandatory:** open a second PR from `main` into `develop` so the fix is not lost.

## 🛟 When do I use a support branch?

Use `support/<name>` for a long-lived maintenance line that must stay separate from current `develop` work. Start it from the appropriate base commit. Day-to-day maintenance opens feature/bugfix PRs **into that support branch**. Git Flow AVH only has `support start`; this repo adds `publish` / `finish` wrappers for syncing or retiring the line itself.

```bash
npm run gf:support:start -- <name> <base>
```

```bash
npm run changeset:add
```

```bash
npm run gf:support:publish -- --allow-no-changeset
```

(Default PR base is `main`; pass `--base` or answer the interactive prompt. Use `--allow-no-changeset` when the new support line has no package bump yet.)

After review + merge when retiring/syncing the line:

```bash
npm run gf:support:finish
```

## 📝 What is `changeset:add` vs `CHANGELOG.md`?

`npm run changeset:add` creates a pending note under `.changeset/` (which package, which semver bump, and a short summary). It does **not** edit `package.json` or `CHANGELOG.md`. Refuse to run it on `main`, `develop`, or `release/*`.

`npm run gf:<type>:publish` requires those pending files. On a TTY with none, it can guide a write (feature: major|minor; others: patch) using canonical filenames. For `release`/`hotfix`, it offers `changeset:version` when pendings remain so `package.json` matches the branch version. Bypass with `--allow-no-changeset` or a TTY confirm for chore/docs/empty support only (not while release/hotfix pendings remain).

`npm run changeset:version` (only on `release/*` or `hotfix/*`, clean working tree) consumes pending notes into `CHANGELOG.md`, bumps `package.json`, and deletes the pending files. There is no separate conventional-changelog generator — Changesets owns `CHANGELOG.md`.

Boolean HEAD/repo gates live as one function per file under `.devenv/tools/git-flow/utils/gates/`. Creating an issue via start can assign collaborators (`gh` collaborator list) before `gh issue create`.

## ⏭️ How do I skip hooks once?

Only with maintainer agreement:

```bash
HUSKY=0 git commit -m "docs: note a local exception"
```

```bash
HUSKY=0 git push
```
