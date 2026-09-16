<p align="center">
  <img src="https://raw.githubusercontent.com/Lifelyn456/lifelyn-web/main/public/logo.png" alt="Lifelyn" width="120" />
</p>

<h1 align="center">Lifelyn Web</h1>
<p align="center"><strong>Your health, remembered.</strong></p>

<p align="center">
  <a href="https://github.com/Lifelyn456/lifelyn-web/actions/workflows/ci.yml"><img src="https://github.com/Lifelyn456/lifelyn-web/actions/workflows/ci.yml/badge.svg" alt="Web checks" /></a>
  <img src="https://img.shields.io/badge/stack-Next.js%2016-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/auth-Freighter%20only-7C3AED" alt="Freighter-only auth" />
  <img src="https://img.shields.io/badge/license-unlicensed-lightgrey" alt="Unlicensed" />
</p>

Lifelyn is a patient-owned health memory: a continuous, evidence-cited timeline of your medical history that only you control. There's no email/password account and no client-side role switch — the only way in is signing a challenge with your own Stellar wallet, and every protected screen re-checks authorization against the live API rather than trusting anything the browser claims. This repository is the Next.js 16 client patients and clinicians actually use.

This repo is one of two halves of the product: it talks to [`lifelyn-api`](https://github.com/Lifelyn456/Lifelyn-api) for everything — there is no mock backend, and no demo/fixture-backed screen. If the API or one of its dependencies is down, the UI fails closed and says so.

## Table of contents

- [Maintainers](#maintainers)
- [Architecture](#architecture)
- [Routes](#routes)
- [Quick start](#quick-start)
- [Testing](#testing)
- [Contributing](#contributing)
- [Contributors](#contributors)

## Maintainers

| | Name | Role | Contact |
| --- | --- | --- | --- |
| 🧑‍💻 | Chijioke | Maintainer | [@precious1joe](https://t.me/precious1joe) on Telegram · [@Cjay-Cyber-2](https://github.com/Cjay-Cyber-2) on GitHub |

## Architecture

```
Freighter (browser wallet)
        │  sign challenge
        ▼
Lifelyn Web  ──HTTPS──▶  Lifelyn API  ──▶  Postgres / Redis / object storage
   (this repo)                │
                               ├──▶ Lifelyn AI (evidence extraction, citations)
                               └──▶ Stellar Soroban contracts (consent, provider,
                                    record attestation, access receipts — opaque
                                    refs and hashes only, never readable medical
                                    content on-chain)
```

Session JWTs are held in memory only and disappear on refresh. Clinical authorization is never trusted from the browser — `lifelyn-api` re-checks scope, expiry, and revocation on every protected request.

## Routes

- **Public**: `/`, `/login`, `/register`
- **Patient**: `/dashboard`, `/records`, `/records/upload`, `/records/[recordId]`, `/timeline`, `/ask`, `/access`, `/audit`, `/settings`
- **Clinician**: `/clinician`, `/clinician/settings`, `/clinician/patients`, `/clinician/patients/[patientId]`, plus authorized timeline, ask, and source-record routes

There are no demo or mock product routes. TanStack Query caches live responses in memory only. Protected screens carry no analytics or session replay.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL
pnpm dev
```

You'll also need:
1. [`lifelyn-api`](https://github.com/Lifelyn456/Lifelyn-api) running (locally or pointed at a hosted instance) — this app has no mock backend.
2. The official [Freighter](https://www.freighter.app/) browser extension, installed and unlocked, switched to Testnet.

## Testing

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

The Playwright suite verifies public routing and fail-closed protected routing; the full cross-service journey requires the live API integration environment.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Found a security issue? See [`SECURITY.md`](SECURITY.md) instead of opening a public issue.

## Contributors

<a href="https://github.com/Lifelyn456/lifelyn-web/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Lifelyn456/lifelyn-web" alt="Contributors" />
</a>
