# Contributing to Lifelyn Web

Thanks for looking at this. A few ground rules before you send a PR.

## Ground rules

- **No real patient data, ever.** Test fixtures must be synthetic. See the root `SECURITY.md` and `BUILD_STATUS.md` for why this is non-negotiable.
- This is a **fail-closed** system. If a dependency (API, AI service, storage) is unavailable, the UI must show an explicit error — never a fake success or a demo fallback.
- Freighter is the only login path. Don't add email/password, mock login, or client-side role selection.

## Getting set up

```bash
pnpm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_BASE_URL
pnpm dev
```

You'll need `lifelyn-api` running (locally or pointed at a hosted instance) for anything beyond the static marketing pages to work — this app has no mock backend.

## Before you open a PR

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

All four must pass locally; CI runs the same checks and will block merge otherwise.

## Commit style

Conventional commits: `type(scope): description` — e.g. `fix(auth): widen clock-skew tolerance`. Keep commits scoped to one logical change.

## Pull requests

- Open against `main`, describe what changed and why, link any related issue.
- Keep PRs reviewable — a large PR that bundles unrelated changes will be asked to split.
- CI (`Web checks` job) must be green before merge.

## Reporting bugs vs. security issues

Regular bugs: open a GitHub issue. Security vulnerabilities: see `SECURITY.md` — do not file those as public issues.
