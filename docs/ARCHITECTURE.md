# Web architecture

Lifelyn Web is the Next.js client of [lifelyn-api](https://github.com/Lifelyn456/Lifelyn-api).
It uses the live API rather than a fixture-backed product backend. This document
describes the client implementation; server-side consent enforcement is the API's
responsibility.

## Route map

Next.js route groups such as `(patient)` and `(clinician)` do not appear in URLs.
The following routes are defined by `src/app/**/page.tsx`.

| Area | Routes | Who can view the screen |
| --- | --- | --- |
| Public | `/`, `/login`, `/register` | Anyone; login and registration use Freighter |
| Patient overview | `/dashboard` | API-confirmed `PATIENT` account |
| Patient records | `/records`, `/records/upload`, `/records/[recordId]` | API-confirmed `PATIENT` account |
| Patient history | `/timeline`, `/ask` | API-confirmed `PATIENT` account |
| Patient management | `/access`, `/audit`, `/settings` | API-confirmed `PATIENT` account |
| Clinician onboarding/security | `/clinician`, `/clinician/settings` | API-confirmed `CLINICIAN` account |
| Clinician patients | `/clinician/patients`, `/clinician/patients/[patientId]` | API-confirmed `CLINICIAN` account; available patient data depends on API authorization |
| Clinician patient history | `/clinician/patients/[patientId]/timeline`, `/clinician/patients/[patientId]/ask` | API-confirmed `CLINICIAN` account; patient-scoped requests must be authorized by the API |
| Clinician source record | `/clinician/patients/[patientId]/records/[recordId]` | API-confirmed `CLINICIAN` account; source access must be authorized by the API |

Both protected route-group layouts render `AppShell` with a required role
(`src/app/(patient)/layout.tsx` and `src/app/(clinician)/layout.tsx`).
`src/components/app-shell.tsx` queries `/me` only when a session token exists.
Until an account with the required role is returned, it renders a verification
message, not the protected children. Missing tokens or account-query errors
redirect to `/login`; a wrong role redirects to that role's home route using
`src/lib/permissions/index.ts`. These browser checks do not replace API authorization.

## Freighter sign-in sequence

The sequence is implemented in `src/components/wallet-login.tsx`; challenge
validation and request/session primitives are in `src/lib/auth.ts`.

1. Check that Freighter is connected, then call `requestAccess()` for the selected
   wallet address. Missing extension, denied access or a missing address stops login.
2. POST `/auth/challenge` with that address. `validateChallenge()` parses the
   response and checks the address, current browser origin, exact canonical message,
   expiry, issue time and maximum five-minute challenge lifetime. It rejects an
   issue time more than five minutes in the future.
3. Call Freighter `signMessage()` with the validated message and address. Require
   a signed message, no wallet error and the same returned signer address.
   This message proves wallet ownership; it is not a payment transaction.
4. POST `/auth/verify` with the challenge ID, address and signature. Store the
   returned token using `setSessionToken()` only after verification succeeds.
5. For login, GET `/me` to load the account. For registration, PATCH `/me` with
   the selected account type, display name and clinician provider type when
   applicable. The registration choice is not a protected-screen role override.
6. Redirect patients to `/dashboard`. Redirect clinicians to `/clinician/patients`
   if MFA is enrolled, or `/clinician/settings` otherwise. Subsequent protected
   rendering still checks the live account through `AppShell`.

The token is a module-level in-memory value, not a cookie or local-storage entry.
Refreshing the page loses it. Requests attach a Bearer header when the token exists,
use `credentials: "omit"` and disable fetch caching. Sign-out clears the token
and the query cache before redirecting to login (`app-shell.tsx`).

## API unavailable behavior

- `apiRequest()` allows three total attempts for connection-level `TypeError`
  failures, waiting one then two seconds before retries. Each fetch has a
  60-second timeout. Timeout and HTTP-error responses are not retried by this
  primitive; HTTP errors use the API's error message or an unavailable-service
  fallback. This policy also applies to POST requests; it is not a guarantee that
  a request was never processed by the server.
- `apiBlob()` uses a 30-second timeout and does not contain a retry loop.
- A sign-in error clears the session token and status, shows an error alert, and
  re-enables the sign-in button. Connection errors explain that the free-tier API
  may need time to wake; no fake account is created.
- `AppShell` disables query retries for `/me` and redirects on query failure,
  without rendering protected children. Data screens use loading/error states;
  `src/components/live-states.tsx` renders "Live service unavailable" for failures.
  There is no fixture fallback in these request primitives.

Typed resource calls are collected in `src/lib/api/client.ts`, with response
types in `src/lib/api/generated/types.ts`. Browser request handling and visible
route gates are not proof of a successful live cross-service login or of
server-side consent correctness; those need the API integration environment.
