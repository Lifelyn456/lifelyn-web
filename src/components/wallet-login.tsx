"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ShieldCheck, Stethoscope, User, Wallet } from "lucide-react";
import { isConnected, requestAccess, signMessage } from "@stellar/freighter-api";
import { Brand } from "./brand";
import { apiRequest, setSessionToken, validateChallenge } from "@/lib/auth";

type Account = { role: "PATIENT" | "CLINICIAN"; mfaState: string };

export function WalletLogin({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<"PATIENT" | "CLINICIAN">("PATIENT");
  const [displayName, setDisplayName] = useState("");
  const [providerType, setProviderType] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function connect() {
    if (register && (!displayName.trim() || (role === "CLINICIAN" && !providerType.trim()))) {
      setError("Complete the account details before connecting Freighter.");
      return;
    }
    setBusy(true); setError(""); setStatus("Looking for Freighter…");
    try {
      if (!(await isConnected()).isConnected) throw new Error("Freighter was not found. Install and unlock the official Freighter extension, then try again.");
      setStatus("Approve the connection in Freighter.");
      const access = await requestAccess();
      if (access.error || !access.address) throw new Error("Wallet connection was not approved.");
      setStatus("Requesting a single-use sign-in challenge…");
      const challenge = validateChallenge(await apiRequest<unknown>("/auth/challenge", { method: "POST", body: JSON.stringify({ address: access.address }) }), access.address, window.location.origin, Date.now());
      setStatus("Review and sign the Lifelyn message in Freighter.");
      const signed = await signMessage(challenge.message, { address: access.address });
      if (signed.error || !signed.signedMessage || signed.signerAddress !== access.address) throw new Error("The selected Freighter wallet did not sign the exact challenge.");
      const verified = await apiRequest<{ token: string }>("/auth/verify", { method: "POST", body: JSON.stringify({ id: challenge.id, address: access.address, signature: typeof signed.signedMessage === "string" ? signed.signedMessage : signed.signedMessage.toString("base64") }) });
      setSessionToken(verified.token);
      setStatus(register ? "Creating your wallet-linked account…" : "Loading your account…");
      const account = register
        ? await apiRequest<Account>("/me", { method: "PATCH", body: JSON.stringify({ role, displayName: displayName.trim(), ...(role === "CLINICIAN" ? { providerType: providerType.trim() } : {}) }) })
        : await apiRequest<Account>("/me");
      router.replace(account.role === "PATIENT" ? "/dashboard" : account.mfaState === "ENROLLED" ? "/clinician/patients" : "/clinician/settings");
    } catch (cause) {
      setSessionToken(null); setStatus("");
      setError(cause instanceof TypeError ? "The Lifelyn API is not reachable. Start the live services and try again." : cause instanceof Error ? cause.message : "Freighter sign-in failed.");
    } finally { setBusy(false); }
  }

  return <div className="auth-layout">
    <section className="auth-story"><Brand /><h1>Your life.<br />Your story.<br /><em>Your Lifelyn.</em></h1><p>Your continuous, patient-owned health memory.</p><img src="/logo.png" alt="" /></section>
    <main className="auth-content"><div className="auth-card">
      <span className="eyebrow">FREIGHTER WALLET AUTHENTICATION</span>
      <h2>{register ? "Create your Lifelyn account." : "Welcome back."}</h2>
      <p>Freighter is the only login method. Lifelyn never receives your private key.</p>
      {register && <>
        <div className="auth-role-options" role="group" aria-label="Account type">
          <button className={role === "PATIENT" ? "selected" : ""} aria-pressed={role === "PATIENT"} onClick={() => setRole("PATIENT")}><User size={17} /> Patient</button>
          <button className={role === "CLINICIAN" ? "selected" : ""} aria-pressed={role === "CLINICIAN"} onClick={() => setRole("CLINICIAN")}><Stethoscope size={17} /> Clinician</button>
        </div>
        <label className="form-field">Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={100} autoComplete="name" /></label>
        {role === "CLINICIAN" && <label className="form-field">Provider type<input value={providerType} onChange={(event) => setProviderType(event.target.value)} maxLength={80} placeholder="e.g. Physician" /></label>}
      </>}
      {error && <div className="error-message" role="alert">{error}</div>}
      {status && <p className="auth-status" role="status">{status}</p>}
      <button className="button" onClick={connect} disabled={busy}><Wallet size={19} />{busy ? "Working…" : register ? "Register with Freighter" : "Sign in with Freighter"}<ArrowUpRight size={17} /></button>
      <div className="wallet-note"><ShieldCheck size={18} /><span>The signed message proves wallet ownership only. No transaction or payment is created.</span></div>
      <div className="auth-divider" />
      <p>{register ? "Already registered?" : "New to Lifelyn?"}</p>
      <Link href={register ? "/login" : "/register"} className="text-button">{register ? "Sign in" : "Create an account"}<ArrowUpRight size={16} /></Link>
      <Link className="auth-back" href="/"><ArrowLeft size={14} /> Back to Lifelyn</Link>
    </div></main>
  </div>;
}
