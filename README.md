# Lifelyn Web

Next.js 16 application for the live Lifelyn patient and clinician workflows. Freighter is the only login method. Session JWTs are held in memory only and disappear on refresh; protected clinical authorization is always enforced again by `lifelyn-api`.

## Routes

- Public: `/`, `/login`, `/register`
- Patient: `/dashboard`, `/records`, `/records/upload`, `/records/[recordId]`, `/timeline`, `/ask`, `/access`, `/audit`, `/settings`
- Clinician: `/clinician`, `/clinician/settings`, `/clinician/patients`, `/clinician/patients/[patientId]`, plus authorized timeline, ask, and source-record routes.

There are no demo or mock product routes. TanStack Query caches live responses in memory only. Protected screens do not use analytics or session replay.

## Run

1. Configure `NEXT_PUBLIC_API_BASE_URL` from `.env.example`.
2. Start the API and its dependencies.
3. Run `pnpm dev`.
4. Install and unlock the official Freighter browser extension.

Production builds use `pnpm lint && pnpm typecheck && pnpm test && pnpm build`. The browser smoke test verifies public routing and fail-closed protected routing; the full cross-service journey requires the live API integration environment.
