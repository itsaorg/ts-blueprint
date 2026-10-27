# `.devenv/_`

Every development script is ESM (`.mjs`). Git hooks stay in `.husky`. Call package scripts with `npm run`.

The boxed banner at the top of every code file is the file-header standard. A JSDoc block sits under that banner. Shell hooks use the same banner as `#` comments.

## Layout

```text
.devenv/_/lib/tool-lib.mjs
.devenv/_/lib/repo-root.mjs
.devenv/_/devenv/git/*.mjs
.devenv/_/devenv/git-flow/check.mjs
.devenv/_/devenv/gh/*.mjs
.devenv/_/devenv/node/check.mjs
.devenv/_/devenv/npm/*.mjs
.devenv/_/tools/<tool>/<action>.mjs
.devenv/_/utils/clean.mjs
.devenv/_/setup/*.mjs
```

`devenv/` holds runtimes a machine needs: git, git-flow, gh, node, and npm. `tools/` holds repo commands such as tsc, prettier, eslint, and vitest. `setup/` orchestrates both.

`devenv/git/configure.mjs`, `setup.mjs`, `install.mjs`, `uninstall.mjs`, and `upgrade.mjs` only log that they are placeholders. They do not change Git. `devenv/git-flow/check.mjs` logs `git flow version` and fails when Git Flow AVH is missing. It does not install Git Flow.

## Setup

| Command                    | Script                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `npm run setup`            | `setup/setup.mjs` then `setup/devenv-setup.mjs` (`npm ci`, `husky:prepare`, `check`) |
| `npm run setup:post-clone` | `setup/post-clone.mjs` then `setup/post-clone-run.mjs`                               |
| `npm run setup:labels`     | `setup/github-labels.mjs` then `devenv/gh/labels-sync.mjs`                           |

See [POST-CLONE-STEPS.md](POST-CLONE-STEPS.md) for the post-clone order.

## GitHub CLI

| Script                           | What it does                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `devenv/gh/check.mjs`            | Logs whether `gh` is on PATH                                                       |
| `devenv/gh/auth-setup.mjs`       | Logs `gh auth status`. On a TTY, runs `gh auth login` when logged out. Skips in CI |
| `devenv/gh/process-label.mjs`    | Creates or updates one label with `gh label create --force`                        |
| `devenv/gh/process-labels.mjs`   | Loops labels from a JSON file                                                      |
| `devenv/gh/label-create.mjs`     | Reads a labels JSON path and calls `process-labels.mjs`                            |
| `devenv/gh/labels-sync.mjs`      | Syncs `.github/labels.json`                                                        |
| `devenv/gh/issue-create.mjs`     | Creates an issue from `.github/ISSUE_BODY.md`                                      |
| `devenv/gh/issue-preview.mjs`    | Logs the create command and does not create the issue                              |
| `devenv/gh/pr-create.mjs`        | Opens a pull request from `.github/PR_BODY.md`                                     |
| `devenv/gh/pr-preview.mjs`       | Logs the create command and does not open the pull request                         |
| `devenv/gh/pr-merge.mjs`         | Merges a pull request                                                              |
| `devenv/gh/pr-merge-preview.mjs` | Logs the merge command and does not merge                                          |

Preview scripts set `DRY_RUN=true`.
