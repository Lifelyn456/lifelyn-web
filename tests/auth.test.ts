import { it, expect } from "vitest";
import { challengeMessage, validateChallenge } from "../src/lib/auth";
const fields = {
  id: "00000000-0000-4000-8000-000000000001",
  address: "test-wallet-address",
  origin: "http://localhost:3000",
  nonce: "a".repeat(64),
  issuedAt: "2026-09-12T12:00:00.000Z",
  expiresAt: "2026-09-12T12:05:00.000Z",
};
const challenge = { ...fields, message: challengeMessage(fields) };
const now = Date.parse("2026-09-12T12:01:00Z");
it("rejects origin substitution, wallet substitution and altered messages", () => {
  expect(() =>
    validateChallenge(challenge, fields.address, fields.origin, now),
  ).not.toThrow();
  expect(() =>
    validateChallenge(challenge, fields.address, "https://evil.example", now),
  ).toThrow();
  expect(() =>
    validateChallenge(challenge, "another-address", fields.origin, now),
  ).toThrow();
  expect(() =>
    validateChallenge(
      { ...challenge, message: "Transfer funds" },
      fields.address,
      fields.origin,
      now,
    ),
  ).toThrow();
});
it("rejects expired challenges", () =>
  expect(() =>
    validateChallenge(
      challenge,
      fields.address,
      fields.origin,
      Date.parse(fields.expiresAt),
    ),
  ).toThrow());
