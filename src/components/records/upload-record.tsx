"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { apiRequest } from "@/lib/auth";

export function UploadRecord() {
  const client = useQueryClient(); const [file, setFile] = useState<File | null>(null); const [recordType, setRecordType] = useState("OTHER"); const [status, setStatus] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function upload() {
    if (!file) return; setBusy(true); setError("");
    try {
      setStatus("Creating a private upload slot…");
      const slot = await apiRequest<{ recordId: string; objectKey: string; uploadUrl: string; requiredHeaders: Record<string, string> }>("/patients/me/records/upload-url", { method: "POST", body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size, recordType, sourceType: "UPLOAD" }) });
      setStatus("Uploading to encrypted processing storage…");
      const uploaded = await fetch(slot.uploadUrl, { method: "PUT", headers: slot.requiredHeaders, body: file });
      if (!uploaded.ok) throw new Error("Object storage rejected the upload.");
      setStatus("Scanning, encrypting, hashing, and queueing ingestion…");
      await apiRequest("/patients/me/records/finalize", { method: "POST", body: JSON.stringify({ recordId: slot.recordId, objectKey: slot.objectKey }) });
      await client.invalidateQueries({ queryKey: ["records", "me"] }); setStatus("Record secured and queued for evidence extraction."); setFile(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); setStatus(""); } finally { setBusy(false); }
  }
  return <><PageHeading eyebrow="PRIVATE BY DESIGN" title="Add a medical record." description="PDF, PNG, or JPEG up to 25 MB. The API validates the actual file contents before ingestion." /><section className="panel review-panel"><Upload size={30} /><h2>Choose a record</h2><label className="form-field">Record type<select value={recordType} onChange={(event) => setRecordType(event.target.value)}><option value="LAB_RESULT">Lab result</option><option value="CONSULTATION">Consultation</option><option value="PRESCRIPTION">Prescription</option><option value="IMAGING">Imaging</option><option value="OTHER">Other</option></select></label><label className="form-field">Medical PDF or image<input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>{error && <p className="error-message" role="alert">{error}</p>}{status && <p className="success-message" role="status">{status}</p>}<button className="button" disabled={!file || busy} onClick={upload}>{busy ? "Securing record…" : "Upload and process"}</button></section></>;
}
