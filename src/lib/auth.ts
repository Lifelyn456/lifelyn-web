import { z } from "zod";
export const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";
let token: string | null = null;
const listeners = new Set<() => void>();
export function setSessionToken(value: string | null) {
  token = value;
  for (const listener of listeners) listener();
}
export function getSessionToken() {
  return token;
}
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function hasSession() {
  return token !== null;
}
export async function apiBlob(path: string): Promise<Blob> {
  const response = await fetch(`${apiBase}${path}`, {
    cache: "no-store",
    credentials: "omit",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? "The source record could not be loaded.");
  }
  return response.blob();
}
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let response: Response;
    try {
      response = await fetch(`${apiBase}${path}`, {
        ...options,
        cache: "no-store",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        // Free-tier hosting can take 50s+ to wake a sleeping instance on the
        // first request after a period of inactivity; a short timeout here
        // would abort that request before the service ever gets a chance to
        // respond.
        signal: AbortSignal.timeout(60000),
      });
    } catch (cause) {
      // A genuine connection-level failure (DNS, refused, no CORS header on
      // the response) throws a TypeError before any HTTP response exists.
      // Free-tier hosting can briefly refuse connections during its own
      // redeploys even while otherwise healthy, so one or two retries clear
      // most of these without ever surfacing an error to the user. A timeout
      // (AbortError) is not retried here: the server may already be
      // processing that request, and retrying a non-idempotent call like
      // /auth/verify could waste the single-use challenge it's holding.
      if (cause instanceof TypeError && attempt < attempts) {
        await sleep(attempt * 1000);
        continue;
      }
      throw cause;
    }
    const body = await response.json().catch(() => null);
    if (!response.ok)
      throw new Error(body?.error?.message ?? "The service is unavailable. Please try again.");
    return body as T;
  }
  throw new Error("The Lifelyn API is not reachable.");
}
export const challengeSchema = z.object({
  id: z.string().uuid(),
  message: z.string().max(2048),
  address: z.string(),
  origin: z.string().url(),
  nonce: z.string().regex(/^[a-f0-9]{64}$/),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type WalletChallenge = z.infer<typeof challengeSchema>;
export function challengeMessage(c: Omit<WalletChallenge, "message">) {
  return `Sign in to Lifelyn\n\nOrigin: ${c.origin}\nWallet: ${c.address}\nChallenge: ${c.id}\nNonce: ${c.nonce}\nIssued: ${c.issuedAt}\nExpires: ${c.expiresAt}\n\nThis proves wallet ownership only. It does not authorize a payment or grant access to medical records.`;
}
export function validateChallenge(raw: unknown, address: string, origin: string, now: number) {
  const c = challengeSchema.parse(raw);
  if (
    c.address !== address ||
    c.origin !== origin ||
    c.message !== challengeMessage(c) ||
    Date.parse(c.expiresAt) <= now ||
    Date.parse(c.issuedAt) > now + 300000 ||
    Date.parse(c.expiresAt) - Date.parse(c.issuedAt) > 300000
  )
    throw new Error("The sign-in challenge could not be verified. Please try again.");
  return c;
}
