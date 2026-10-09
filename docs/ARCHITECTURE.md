# Web architecture

Lifelyn Web is a Next.js app. It has **no login form and no password**. A user signs in by proving they control a Stellar wallet through the Freighter browser extension. Every protected screen calls the live `Lifelyn-api` and fails closed: if the API or a dependency behind it is unavailable, the screen shows an explicit error and never a placeholder.

## Route map

| Route | Who | What it shows |
| --- | --- | --- |
| `/` | anyone | Landing page |
| `/login` | anyone | Sign in with Freighter |
| `/register` | anyone | Sign in with Freighter and create an account (patient or clinician) |
| `/dashboard` | patient | Overview |
| `/records`, `/records/upload`, `/records/[recordId]` | patient | List, upload and view the original of a medical record |
| `/timeline` | patient | The evidence-cited health timeline |
| `/ask` | patient | Ask questions about their own history |
| `/access` | patient | Access requests and consent grants, including revocation |
| `/audit` | patient | Who accessed what, and when |
| `/settings` | patient | Account settings |
| `/clinician/patients` | clinician | Patients who granted this clinician access |
| `/clinician/patients/[patientId]` and `/timeline`, `/ask`, `/records/[recordId]` | clinician | A patient's data, only within the consent that patient granted |
| `/clinician/settings` | clinician | Account and passkey (MFA) settings |

The patient and clinician areas are route groups with their own layout. Each layout wraps its pages in `AppShell`, which enforces the role (`src/components/app-shell.tsx`).

### Route guards

`AppShell` loads the account (`GET /me`) and then:

| Situation | Result |
| --- | --- |
| No session token, or the account request fails | Redirect to `/login` |
| Signed in, but the role does not match the area | Redirect to that role's home (`/dashboard` for a patient, `/clinician/patients` for a clinician) |
| Role matches | The page renders |

The guard is a convenience for the user. **The API is the authorization boundary:** it checks the session and the patient's consent on every request, so bypassing the client guard gains nothing.

## Sign-in flow (Freighter)

Implemented in `src/components/wallet-login.tsx` and `src/lib/auth.ts`.

1. The app checks that Freighter is installed and unlocked. If not, it says so.
2. `requestAccess()` asks the user to approve the connection and returns the wallet address.
3. `POST /auth/challenge` with the address returns a single-use challenge.
4. **The app verifies the challenge itself** (`validateChallenge`) before asking for a signature. It rebuilds the exact message from the challenge fields and requires that the address and origin match the page, that the challenge has not expired, that it was not issued in the future (allowing 5 minutes of clock skew), and that its lifetime is at most 5 minutes. Anything else is refused.
5. `signMessage()` asks the user to sign the message in Freighter. The message states that it proves wallet ownership only and does not authorize a payment or grant access to records.
6. The app checks that the signer address is the connected address.
7. `POST /auth/verify` with the challenge id, address and signature returns a session token.
8. The token is stored by `setSessionToken`.
9. On `/register`, `PATCH /me` creates the account with the chosen role and name (a clinician also gives a provider type). On `/login`, `GET /me` loads it.
10. The user is sent to `/dashboard` (patient), `/clinician/patients` (clinician with passkey MFA enrolled) or `/clinician/settings` (clinician who still needs to enrol).

If any step fails the token is cleared and a plain message is shown.

### Where the session lives

The token is held in a module variable in memory (`src/lib/auth.ts`). It is not written to `localStorage`, `sessionStorage`, cookies or IndexedDB, and API requests are sent with `credentials: "omit"`. Reloading the page ends the session. That is deliberate.

## When the API is unavailable

- A network failure (a `TypeError` from `fetch`) is retried up to 3 times with a growing delay. A timeout is **not** retried, because the server may already be processing it and `/auth/verify` consumes a single-use challenge.
- The login screen explains that a free-tier service can take about a minute to wake up.
- List and detail screens show a "Live service unavailable" panel with the API's own error message.
- The upload screen checks the file type and size (PDF, PNG or JPEG, 1 byte to 25 MB, the same limits as the API) before any request, and shows an explicit error if a step fails.

## Security headers

`next.config.ts` sets these on every response, and `tests/e2e/security-headers.spec.ts` asserts them:

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `connect-src` limited to the app and the API origin |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `same-origin` |
| `Strict-Transport-Security` | two years, with `includeSubDomains` and `preload` |
| `Permissions-Policy` | camera, microphone and geolocation off |

`script-src` and `style-src` still allow `'unsafe-inline'`, which Next.js needs for its inline bootstrap scripts without a nonce. Moving to nonces is a known improvement.

## Accessibility

`tests/e2e/accessibility.spec.ts` runs axe-core (WCAG 2.1 A and AA) on every route reachable without a session, and checks that the first Tab stop is a real control. Protected routes redirect to `/login` without a live API, so they are not audited yet.

## Code layout

| Path | Contents |
| --- | --- |
| `src/app` | Routes, in `(patient)` and `(clinician)` groups |
| `src/components` | UI by area: `records`, `timeline`, `consent`, `chat`, `audit`, `clinician`, `ui` |
| `src/lib/auth.ts` | Session token, `apiRequest`, `apiBlob`, challenge validation |
| `src/lib/api` | Typed API client and generated types |
| `src/lib/permissions` | Role checks and each role's home route |
| `src/lib/upload-validation.ts` | Client-side upload limits that mirror the API |
| `tests` | Vitest component tests and Playwright end-to-end tests |
