# Security policy

Lifelyn is a healthcare-record product. This repository (the web client) is **unaudited**. Do not point it at real patient data or treat it as compliant with HIPAA, GDPR, NDPR, or any other regime until an independent security review and the jurisdiction-specific legal review described in the root `BUILD_STATUS.md` are complete.

## Scope

This policy covers the `lifelyn-web` repository: the Next.js patient/clinician application, its build configuration, and its client-side auth/session handling. Backend authorization, encryption, consent enforcement, and the Soroban contracts are covered by `SECURITY.md` in `lifelyn-api` and `lifelyn-contracts` respectively — if your finding is about those, report it there instead (or here if you're unsure; we'll route it).

## Reporting a vulnerability

Please **do not** open a public GitHub issue for a security finding.

- Preferred: use this repository's [GitHub Security Advisories](https://github.com/Lifelyn456/lifelyn-web/security/advisories/new) ("Report a vulnerability" under the Security tab) for a private disclosure channel.
- Alternative: contact **@precious1joe** on Telegram with a clear description, reproduction steps, and impact. Do not include real patient data or live credentials in the report.

We aim to acknowledge reports within 5 business days. Please give us reasonable time to remediate before any public disclosure.

## What's in scope

- Authentication bypass (Freighter challenge/session handling)
- XSS, CSRF, or CSP bypass in the web client
- Client-side exposure of data that should require consent/authorization
- Supply-chain issues in this repo's dependencies

## What's out of scope

- Findings that require physical access to a user's device or browser
- Denial-of-service via resource exhaustion against free-tier hosting
- Issues already tracked in open GitHub issues or `BUILD_STATUS.md`
