"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/auth";
import { PageHeading } from "@/components/page-heading";

export default function Page() {
  const [patientId, setPatientId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [hours, setHours] = useState(24);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await apiRequest(`/patients/${patientId}/access-requests`, {
        method: "POST",
        body: JSON.stringify({
          scope: {
            actions: ["read", "ask", "integrity-check"],
            resourceClasses: ["records", "timeline", "observations", "history", "fhir"],
          },
          expiresAt: new Date(Date.now() + hours * 3600000).toISOString(),
          purpose,
        }),
      });
      setStatus(
        "Access request sent. The patient must approve it before any clinical record can be opened.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Request failed.");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="PATIENT-CONTROLLED ACCESS"
        title="Request patient access."
        description="You need verified provider status, a current passkey assertion, and explicit patient approval."
      />
      <section className="panel settings-panel">
        <form onSubmit={submit}>
          <label className="form-field">
            Patient profile ID
            <input
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              required
              placeholder="UUID shared by the patient"
            />
          </label>
          <label className="form-field">
            Clinical purpose
            <textarea
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              required
              maxLength={300}
            />
          </label>
          <label className="form-field">
            Requested duration (hours)
            <input
              type="number"
              min={1}
              max={720}
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
            />
          </label>
          <button className="button">Send scoped request</button>
        </form>
        {status && (
          <>
            <p className="success-message" role="status">
              {status}
            </p>
            <Link className="text-button" href={`/clinician/patients/${patientId}`}>
              Open patient workspace after approval →
            </Link>
          </>
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
