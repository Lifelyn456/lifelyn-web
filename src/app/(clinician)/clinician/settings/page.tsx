"use client";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { apiRequest, setSessionToken } from "@/lib/auth";
import type { Account } from "@/types/api";
import { PageHeading } from "@/components/page-heading";
import { Failure, Loading } from "@/components/live-states";

export default function Page() {
  const client = useQueryClient();
  const account = useQuery({ queryKey: ["me"], queryFn: () => apiRequest<Account>("/me") });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  async function enroll() {
    setBusy(true);
    setError("");
    try {
      const options = await apiRequest<Parameters<typeof startRegistration>[0]["optionsJSON"]>(
        "/auth/mfa/register/options",
        { method: "POST" },
      );
      const response = await startRegistration({ optionsJSON: options });
      await apiRequest("/auth/mfa/register/verify", {
        method: "POST",
        body: JSON.stringify(response),
      });
      await client.invalidateQueries({ queryKey: ["me"] });
      setStatus("Passkey enrolled. Verify it now to unlock this clinical session.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Passkey enrollment failed.");
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    setBusy(true);
    setError("");
    try {
      const options = await apiRequest<Parameters<typeof startAuthentication>[0]["optionsJSON"]>(
        "/auth/mfa/authenticate/options",
        { method: "POST" },
      );
      const response = await startAuthentication({ optionsJSON: options });
      const result = await apiRequest<{ token: string }>("/auth/mfa/authenticate/verify", {
        method: "POST",
        body: JSON.stringify(response),
      });
      setSessionToken(result.token);
      setStatus("MFA verified for this 15-minute clinical session.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Passkey verification failed.");
    } finally {
      setBusy(false);
    }
  }
  if (account.isPending) return <Loading />;
  if (account.error) return <Failure error={account.error} />;
  return (
    <>
      <PageHeading
        eyebrow="CLINICAL SESSION SECURITY"
        title="Provider passkey MFA."
        description="Freighter remains the only login. A registered passkey is an additional factor required for protected clinical access."
      />
      <section className="panel settings-panel">
        <KeyRound />
        <h2>{account.data.mfaState === "ENROLLED" ? "Passkey enrolled" : "Passkey required"}</h2>
        <p>Use a platform passkey or FIDO2 security key with user verification.</p>
        <div className="access-actions">
          {account.data.mfaState !== "ENROLLED" && (
            <button className="button" onClick={enroll} disabled={busy}>
              Enroll passkey
            </button>
          )}
          <button
            className="button button-outline"
            onClick={verify}
            disabled={busy || account.data.mfaState !== "ENROLLED"}
          >
            Verify this session
          </button>
        </div>
        {status && (
          <p className="success-message" role="status">
            {status}
          </p>
        )}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </section>
    </>
  );
}
