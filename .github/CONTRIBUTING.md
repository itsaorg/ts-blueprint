# Contributing

## 🗂️ Table Of Contents

- [Contributing](#contributing)
  - [🗂️ Table Of Contents](#️-table-of-contents)
  - [🧰 Prerequisites](#-prerequisites)
  - [📥 Clone and install](#-clone-and-install)
  - [🌿 Start a branch](#-start-a-branch)
  - [🧪 Scripts](#-scripts)
  - [📁 `.devenv` layout](#-devenv-layout)
  - [🐶 Prepare lifecycle](#-prepare-lifecycle)
  - [🔄 Post-clone](#-post-clone)
  - [💬 Commit messages](#-commit-messages)
  - [🪝 Husky hooks](#-husky-hooks)
  - [🐛 Open an issue](#-open-an-issue)
  - [🏷️ Labels](#️-labels)
  - [🔀 Open a pull request](#-open-a-pull-request)
  - [✅ Required check](#-required-check)
  - [📘 How-to FAQ](#-how-to-faq)

Follow the steps in order the first time. Later changes can start at [Start a branch](#-start-a-branch). Step-by-step tutorials live in [HOW-TO.md](HOW-TO.md).

## 🧰 Prerequisites

Install these before you clone:

1. Git.
2. Node.js at the version in `.nvmrc`. Check with `node -v`.
3. npm (it ships with Node).
4. Git Flow AVH, only if you will start feature branches the way this repo expects (`git flow version`).

You do not need a global TypeScript install. Project tools live in `devDependencies` and run through `npm run`.

## 📥 Clone and install

```bash
git clone <repository HTTPS URL>
```

```bash
cd <repository directory>
```

```bash
npm clean-install
```

`npm clean-install` installs the exact lockfile (same as the old `npm ci` alias; this repo uses the long name). It runs `prepare` (Husky, local commit template, gh/npm auth when possible, label sync). Do not use `npm install` for a clean checkout unless a maintainer asked you to refresh the lockfile.

## 🌿 Start a branch

Branches follow Git Flow AVH: `main`, `develop`, `feature/`, `bugfix/`, `release/`, `hotfix/`, `support/`. Tags use the prefix `v`.

Day-to-day work starts from `develop`:

```bash
git checkout develop
```

```bash
git pull origin develop
```

```bash
git flow feature start <number>-<slug>
```

Replace `<number>` with the issue number and `<slug>` with a few words, for example `git flow feature start 12-page-address`. Finish topic branches with a pull request — see [HOW-TO.md](HOW-TO.md).

Put product types under `src/`. Do not add a root `types/` directory. The published entry is `dist/`.

## 🧪 Scripts

Every `package.json` script name starts with the tool, then an action (`tsc:typecheck`, `vitest:run`). Repo command scripts run `node .devenv/deps/<tool>/<action>.mjs`. Machine runtime scripts live under `.devenv/tools/`. Clean scripts run `node .devenv/utils/clean.mjs`. Call them with `npm run`. Do not call `tsc`, `eslint`, or `vitest` directly. Every code file starts with the boxed banner: emoji title, what the file does, how to run or load it, and the Apache-2.0 copyright.

| Script                              | What it does                                                                                                   | Writes files?                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `npm run check`                     | CI gate, in order: `tsc:typecheck`, `prettier:check`, `eslint:lint`, `layout:check`, `vitest:run`, `tsc:build` | Yes. The last step rebuilds `dist/`                 |
| `npm run tsc:typecheck`             | Typecheck only (`tsc --noEmit`)                                                                                | No                                                  |
| `npm run tsc:emit`                  | Emit JavaScript and declarations into `dist/`                                                                  | Yes, `dist/`                                        |
| `npm run tsc:build`                 | `clean:dist`, then `tsc:emit`                                                                                  | Yes, replaces `dist/`                               |
| `npm run clean:dist`                | Delete `dist/` through `.devenv/utils/clean.mjs`                                                               | Yes, deletes `dist/`                                |
| `npm run clean:coverage`            | Delete `coverage/` through `.devenv/utils/clean.mjs`                                                           | Yes, deletes `coverage/`                            |
| `npm run clean:docs`                | Delete tracked `docs/` through `.devenv/utils/clean.mjs`                                                       | Yes, deletes `docs/`                                |
| `npm run clean:modules`             | Delete `node_modules/` through `.devenv/utils/clean.mjs`                                                       | Yes, deletes `node_modules/`                        |
| `npm run clean:all`                 | `clean:dist`, `clean:coverage`, `clean:docs`, then `clean:modules`                                             | Yes, deletes those trees                            |
| `npm run prettier:check`            | Check formatting                                                                                               | No                                                  |
| `npm run prettier:write`            | Rewrite formatting                                                                                             | Yes, source and docs                                |
| `npm run eslint:lint`               | Lint                                                                                                           | No                                                  |
| `npm run eslint:fix`                | Lint and autofix                                                                                               | Yes, source                                         |
| `npm run layout:check`              | One principal export per source file                                                                           | No                                                  |
| `npm run vitest:run`                | Tests once                                                                                                     | No                                                  |
| `npm run vitest:verbose`            | Tests once, verbose reporter                                                                                   | No                                                  |
| `npm run vitest`                    | Vitest in watch mode                                                                                           | No, until you quit the watcher                      |
| `npm run vitest:coverage`           | Tests plus a coverage report                                                                                   | Yes, `coverage/`                                    |
| `npm run commitlint`                | Check a commit message                                                                                         | No                                                  |
| `npm run lint-staged`               | Prettier and ESLint on staged files                                                                            | Yes, staged files                                   |
| `npm run typedoc:build`             | Generate API docs into `docs/`                                                                                 | Yes, `docs/`                                        |
| `npm run docify:typedoc`            | `clean:docs`, then `typedoc:build` (regenerate GitHub Pages site)                                              | Yes, replaces `docs/`                               |
| `npm run changeset:status`          | Show pending Changesets                                                                                        | No                                                  |
| `npm run changeset:version`         | Apply Changesets to the version and changelog                                                                  | Yes, `package.json`, `CHANGELOG.md`, `.changeset/`  |
| `npm run husky:prepare`             | Install git hooks                                                                                              | Yes, `.husky/_` internals                           |
| `npm run prepare`                   | Husky, then idempotent git/node/gh/npm/git-flow setups                                                         | Yes, hooks, local git config, labels when allowed   |
| `npm run git:setup`                 | Ensure git is installed and local `commit.template` is set                                                     | Yes, local git config                               |
| `npm run node:setup`                | Ensure node/npm on PATH; soft-check major vs `.nvmrc` (else `engines.node`)                                    | No                                                  |
| `npm run npm:setup`                 | Ensure npm auth on a TTY (skips CI; never `npm:trust`)                                                         | Yes, npm login when needed                          |
| `npm run git-flow:setup`            | Ensure Git Flow AVH init for `main`/`develop` (skips if missing)                                               | Yes, local git-flow config when present             |
| `npm run npm:publish:local`         | Interactive npm name reservation                                                                               | Yes, publishes to npm                               |
| `npm run npm:publish:worker`        | Publish from CI with provenance                                                                                | Yes, publishes to npm                               |
| `npm run npm:release`               | `tsc:build`, then `npm:publish:worker`                                                                         | Yes, `dist/` and npm                                |
| `npm run npm:trust`                 | Link Trusted Publishing                                                                                        | Yes, npm trust settings                             |
| `npm run npm:deprecate:reservation` | Deprecate a name-reservation publish                                                                           | Yes, npm deprecation message                        |
| `npm run setup`                     | `npm clean-install` (runs `prepare`), then `check`                                                             | Yes, `node_modules/` and `dist/`                    |
| `npm run setup:post-clone`          | Git and Node checks, then `npm clean-install` (runs `prepare`)                                                 | Yes, `node_modules/` and local prepare side effects |
| `npm run gh:label:sync`             | Exclusive sync of `.github/labels.json` with `gh` (upsert catalog; delete remote labels not listed)            | Yes, GitHub labels                                  |
| `npm run gh:setup`                  | Ensure `gh` auth, then exclusive label sync                                                                    | Yes, GitHub labels when authenticated               |

Do not run the `npm:*` scripts unless a maintainer asked you to publish or change trust. When Trusted Publishing is configured, it is bound to `.github/workflows/release.yml`.

`docs/` is the TypeDoc site used for GitHub Pages. It is tracked. `clean:docs` and `docify:typedoc` rewrite that tree; after `clean:all`, run `npm run docify:typedoc` and commit `docs/` again before you push Pages content.

Hooks and GitHub Actions call `npm run` only. CI runs `npm run check` and does not publish.

## 📁 `.devenv` layout

Every development script is ESM (`.mjs`). Git hooks stay in `.husky`. Call package scripts with `npm run`.

```text
.devenv/lib/                 Shared helpers (tool-lib, repo-root)
.devenv/tools/               Machine runtimes: git, git-flow, gh, node, npm
.devenv/deps/                Repo commands: tsc, prettier, eslint, vitest, husky, …
.devenv/utils/clean.mjs      Shared path cleaner
.devenv/setup/               setup, post-clone, and label sync entry points
```

`tools/` holds runtimes a machine needs. `deps/` holds repo commands such as tsc and prettier. Scripts under `.devenv/tools/**` export functions for import and also run as CLIs. `setup/` only orchestrates multi-tool flows (prepare, post-clone, setup), not single-tool shims. Under `tools/gh/`, use `auth/` (mirrors `gh auth` subcommands), `label/`, `issue/`, `pr/`, plus `setup.mjs` and `isInstalled.mjs`.

## 🐶 Prepare lifecycle

**Entry point:** `npm run prepare` (also runs automatically after `npm clean-install` / `npm install`)

**Implementation:** `.devenv/setup/prepare-run.mjs`

Order:

1. `husky:prepare` — install hooks under `.husky/`
2. `git:setup` — fail if `git` is missing; set local `commit.template`
3. `node:setup` — soft-check node/npm vs `.nvmrc` (else `engines.node`; does not fail prepare)
4. `gh:setup` — ensure `gh` auth, then exclusive label sync (skips in CI as needed)
5. `npm:setup` — skip in CI; `npm login` on a TTY when logged out (not `npm:trust`)
6. `git-flow:setup` — soft-skip if Git Flow AVH is missing; else ensure init for `main`/`develop`

Idempotent. Does not run `npm clean-install`, `check`, or Trusted Publishing.

## 🔄 Post-clone

**Entry point:** `npm run setup:post-clone`

**Implementation:** `.devenv/setup/post-clone-run.mjs`

Order:

1. `.devenv/tools/git/isInstalled.mjs` — fail if `git` is missing
2. `.devenv/tools/node/isInstalled.mjs` — fail if `node` or `npm` is missing
3. `npm clean-install` — runs `prepare` (Husky, commit template, auth, labels)

## 💬 Commit messages

Commitlint uses Conventional Commits (`configs/commitlint.config.js` extends `@commitlint/config-conventional`).

Subject types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

```text
docs(github): expand the security policy

Explain private vulnerability reporting in numbered steps.
Keep each body line at 100 characters or fewer.
```

Rules that reject a commit:

- The subject must match `type(scope): subject` or `type: subject`.
- Each **body** line must be **100 characters or fewer**. Wrap the body yourself. Commitlint does not wrap it for you.

`prepare` sets local `commit.template` to `.github/COMMIT_TEMPLATE/commit.txt`. Confirm with:

```bash
git config --local --get commit.template
```

The command should print `.github/COMMIT_TEMPLATE/commit.txt`. Lines in that file that start with `#` are comments. Git removes them when you save the message.

## 🪝 Husky hooks

Hooks install through `prepare` (via `npm clean-install` or `npm run prepare`). They only call `npm run`.

| Hook          | What it runs                                      |
| ------------- | ------------------------------------------------- |
| `pre-commit`  | `lint-staged`, then `check`                       |
| `commit-msg`  | `commitlint -- --edit` on the message file        |
| `pre-push`    | `check`                                           |
| `post-commit` | Local success log (short SHA and package version) |

Skip every hook for a single command:

```bash
HUSKY=0 git commit -m "docs: note a local exception"
```

```bash
HUSKY=0 git push
```

Use that only when a maintainer agrees. Do not edit files under `.husky/_/`. Those files belong to the Husky package. Do not `source` `.husky/_/husky.sh`.

## 🐛 Open an issue

Blank issues are off (`.github/ISSUE_TEMPLATE/config.yml`). GitHub only offers the templates.

| Kind            | YAML form (website chooser) | Markdown twin (same headings) |
| --------------- | --------------------------- | ----------------------------- |
| Defect          | `bug_report.yml`            | `bug_report.md`               |
| Contract change | `feature_request.yml`       | `feature_request.md`          |
| Tooling or docs | `chore_docs.yml`            | `chore_docs.md`               |

The YAML form is the interactive page. On submit, GitHub turns each field label into a Markdown heading. The `.md` file is a second card with those same headings. Editing one does not update the other. Keep the headings identical when you change them.

Security and conduct reports do not use these templates. Use `.github/SECURITY.md`.

## 🏷️ Labels

The template applies the type label. Do not also invent a label name.

1. Bug report: both the Markdown card and the YAML form apply `🐞 Bug Report`.
2. Feature request: both formats apply `✨ Feature Request`.
3. Chore or docs: both formats apply `🧹 Chore`. Add `📚 Documentation` by hand when the change is docs and not tooling.
4. Do not open a public issue for a vulnerability or a conduct report, and do not add a security label. Use `.github/SECURITY.md`.
5. Maintainers apply Status, Priority, and Git Flow labels. Contributors do not need to set those.
6. `good first issue` and `help wanted` are the exact names GitHub's Contribute and help-wanted views read (no emoji prefix). Dependabot applies `🔗 Dependencies` and opens branches under `dependabot/`.

The full set lives in `.github/labels.json`. `npm run gh:label:sync` is exclusive: it upserts that catalog and deletes any remote label not listed.

## 🔀 Open a pull request

Push your `feature/` branch and open a pull request into `develop`. GitHub fills the description from `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`. There is no YAML form for pull requests. Fill these sections:

1. **Summary.** Why the change is needed.
2. **Linked issues.** `Closes #123` when this pull request finishes that issue.
3. **Test plan.** Commands you ran. Code changes should include `npm run check`.
4. **Checklist.** Conventional Commits, public contract notes, and docs.

Wait for the `ci` workflow. It runs `npm run check` on the pull request. Finish and merge procedures for each Git Flow type are in [HOW-TO.md](HOW-TO.md).

## ✅ Required check

Before you ask for review, run the same gate CI runs:

```bash
npm run check
```

That command typechecks, checks formatting, lints, checks layout, runs tests, then rebuilds `dist/`. It does not collect coverage. Coverage is optional:

```bash
npm run vitest:coverage
```

## 📘 How-to FAQ

Step-by-step, command-by-command guides (clone, issues, Git Flow finish via pull request) are in [HOW-TO.md](HOW-TO.md).
