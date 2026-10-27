# Post-clone

**Entry point:** `npm run setup:post-clone`

**Implementation:** `.devenv/_/setup/post-clone-run.mjs`

Order:

1. `_/devenv/git/check.mjs` — fail if `git` is missing
2. `_/devenv/node/check.mjs` — fail if `node` or `npm` is missing
3. `npm ci`
4. `npm run husky:prepare`
5. `_/devenv/gh/check.mjs` — skip the rest of this list if `gh` is missing
6. Skip `gh` auth and label sync when `CI` or `GITHUB_ACTIONS` is set
7. If `gh auth status` succeeds, sync `.github/labels.json` through `_/devenv/gh/process-labels.mjs`

This sequence does not run `git config`. Hooks are installed by `husky:prepare` into `.husky`.
