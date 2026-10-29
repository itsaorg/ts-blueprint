# Security

## 🗂️ Table Of Contents

- [Security](#security)
  - [🗂️ Table Of Contents](#️-table-of-contents)
  - [🛡️ What this covers](#️-what-this-covers)
  - [📌 Supported versions](#-supported-versions)
  - [🔒 Report a vulnerability in private](#-report-a-vulnerability-in-private)
  - [📝 What to include](#-what-to-include)
  - [🚫 What not to post in public](#-what-not-to-post-in-public)
  - [🛠️ What maintainers do next](#️-what-maintainers-do-next)
  - [🧭 Out of scope](#-out-of-scope)

## 🛡️ What this covers

This policy is only for this repository and the npm package named in `package.json`.

A vulnerability is a flaw that lets someone break confidentiality, integrity, or availability of this package or of a project that depends on it. Ordinary bugs and feature ideas are not security reports.

## 📌 Supported versions

| Version                            | Supported |
| ---------------------------------- | --------- |
| Latest published release on `main` | Yes       |
| Name-reservation publish           | No        |

A publish that only reserves the package name is not a supported product release. Report problems against the latest published version, or against a commit on `main` if nothing newer is published yet.

## 🔒 Report a vulnerability in private

Do not open a public GitHub issue for a security report. Do not describe the flaw in a pull request, commit message, or discussion.

Use GitHub private vulnerability reporting:

1. Open this repository on GitHub.
2. Open the **Security** tab.
3. Choose **Report a vulnerability** (wording can be **Report a security vulnerability**).
4. Write the report in that private form. Only maintainers with access can read it.
5. Submit the form. Stay available for follow-up questions on that same private thread.

If the Security tab does not offer private reporting, contact a repository maintainer through a private GitHub message and ask them to open a private advisory. Still do not post the details in public.

## 📝 What to include

- Package version or the full git commit you tested. From a checkout of this repository:

```bash
npm view "$(node -p "require('./package.json').name")" version
```

- What an attacker can do, and who is affected.
- Step-by-step reproduction. Prefer a small snippet over a long story.
- Whether you have already shared the report anywhere else.

You do not need a finished exploit. A clear description is enough to start.

## 🚫 What not to post in public

- Proof-of-concept code, payloads, or screenshots that show the flaw.
- The report text, even if you remove the repository name.
- A public issue titled "security" with the details in the body.
- A security label on a public issue. This repository has no public security label.

Public bug and feature templates are for non-security work. See `.github/ISSUE_TEMPLATE/`.

## 🛠️ What maintainers do next

1. Read the private report and reply to confirm it was received.
2. Reproduce the problem and decide severity.
3. Prepare a fix on a private path. Do not ask you to open a public pull request for the embargoed details.
4. Publish a fixed release, then publish a GitHub Security Advisory when a fix exists.
5. Credit you in the advisory if you want credit and it is safe to do so.

There is no paid bug-bounty program for this repository.

## 🧭 Out of scope

Use a normal issue template instead when the topic is:

- A feature request or a contract change (`.github/ISSUE_TEMPLATE/feature_request.yml`).
- A defect that does not cross a security boundary (`.github/ISSUE_TEMPLATE/bug_report.yml`).
- Tooling, docs, or maintenance (`.github/ISSUE_TEMPLATE/chore_docs.yml`).
- A question about how to use the public types.

Conduct concerns that are not software vulnerabilities still stay off public issues. Follow `.github/CODE_OF_CONDUCT.md` and send them through the same private Security tab path.
