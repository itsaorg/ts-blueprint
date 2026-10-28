# @itsaorg/ts-blueprint

GitHub template for Itsa TypeScript libraries. Clone from this repository, rename the package identity, then start product code under `src/`.

## 🗂️ Table Of Contents

- [@itsaorg/ts-blueprint](#itsaorgts-blueprint)
  - [🗂️ Table Of Contents](#️-table-of-contents)
  - [Requirements](#requirements)
  - [Use this template](#use-this-template)
  - [Rename checklist](#rename-checklist)
  - [Layout](#layout)
  - [Key scripts](#key-scripts)
  - [Links](#links)

## Requirements

- Node.js 26 (see `.nvmrc`)
- npm (ships with Node)
- Git
- Git Flow AVH, if you start branches with `git flow`

On Windows, use Git Bash. Install Node from [nodejs.org](https://nodejs.org/), nvm-windows, or fnm. Install Git Flow AVH from the [AVH wiki](https://github.com/petervanderdoes/gitflow-avh/wiki/Installation).

## Use this template

1. Open [itsaorg/ts-blueprint](https://github.com/itsaorg/ts-blueprint) on GitHub.
2. Click **Use this template** → **Create a new repository**.
3. Choose owner, name, and visibility. Create the repository.
4. Clone your new repository and install:

```bash
git clone <your-repo-HTTPS-URL>
cd <your-repo-directory>
npm ci
```

For a first-time machine check plus optional GitHub label sync:

```bash
npm run setup:post-clone
```

`npm ci` runs `prepare`, which runs `husky:prepare` and turns on git hooks. Prefer `npm ci` for a clean checkout. Use `npm install` only when refreshing the lockfile.

## Rename checklist

Replace blueprint identity with your package before you publish or open Trusted Publishing:

| Location                            | What to change                                                    |
| ----------------------------------- | ----------------------------------------------------------------- |
| `package.json`                      | `name`, `description`, `repository.url`, `bugs`, `homepage`       |
| `NOTICE`                            | Package name and one-line description                             |
| `configs/typedoc.json`              | `"name"`                                                          |
| `src/**` file banners and examples  | Package import name                                               |
| `tests/consumer/public-api.test.ts` | Deep-import probe package name                                    |
| npm Trusted Publishing              | `npm run npm:trust` after the GitHub repo and `release.yml` exist |
| Labels                              | `npm run setup:labels` when `gh` is authenticated                 |

Do not change portable paths under `.devenv` or the community policy files under `.github/` unless you mean to fork the toolchain.

## Layout

```text
.devenv/            Script library (lib, tools, deps, utils, setup)
.husky/             Git hooks (Husky)
.github/            Issues, PRs, workflows, labels, CONTRIBUTING
configs/            ESLint, Prettier, Vitest, TypeDoc, tsconfig pieces
src/                Library source (`base/`, `types/`, package root)
tests/              Consumer and unit tests
```

TypeDoc writes to `docs/` (gitignored). Do not commit generated docs.

## Key scripts

| Script                     | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `npm run setup:post-clone` | Git/Node checks, `npm ci`, Husky, optional label sync |
| `npm run setup`            | `npm ci`, Husky, then `npm run check`                 |
| `npm run setup:labels`     | Sync `.github/labels.json` with `gh`                  |
| `npm run check`            | Typecheck, format, lint, layout, tests, build         |
| `npm run typedoc`          | Generate API docs into `docs/`                        |

The full script table and post-clone order live in [CONTRIBUTING](.github/CONTRIBUTING.md).

## Links

- [Contributing](.github/CONTRIBUTING.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security](.github/SECURITY.md)
- [License](LICENSE)
