"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { api } from "@/lib/api/client";

export type UploadStage = "idle" | "creating-slot" | "uploading" | "finalizing" | "done" | "error";

export function UploadRecord() {
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState("OTHER");
  const [stage, setStage] = useState<UploadStage>("idle");
  const [error, setError] = useState("");
  const statusByStage: Record<UploadStage, string> = {
    idle: "",
    "creating-slot": "Creating a private upload slot…",
    uploading: "Uploading to encrypted processing storage…",
    finalizing: "Scanning, encrypting, hashing, and queueing ingestion…",
    done: "Record secured and queued for evidence extraction.",
    error: "",
  };
  const busy = stage !== "idle" && stage !== "done" && stage !== "error";
  async function upload() {
    if (!file) return;
    setError("");
    try {
      setStage("creating-slot");
      const slot = await api.records.createUploadUrl({
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        recordType,
        sourceType: "UPLOAD",
      });
      setStage("uploading");
      const uploaded = await fetch(slot.uploadUrl, {
        method: "PUT",
        headers: slot.requiredHeaders,
        body: file,
      });
      if (!uploaded.ok) throw new Error("Object storage rejected the upload.");
      setStage("finalizing");
      await api.records.finalize({ recordId: slot.recordId, objectKey: slot.objectKey });
      await client.invalidateQueries({ queryKey: ["records", "me"] });
      setStage("done");
      setFile(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
      setStage("error");
    }
  }
  const status = statusByStage[stage];
  return (
    <>
      <PageHeading
        eyebrow="PRIVATE BY DESIGN"
        title="Add a medical record."
        description="PDF, PNG, or JPEG up to 25 MB. The API validates the actual file contents before ingestion."
      />
      <section className="panel review-panel">
        <Upload size={30} />
        <h2>Choose a record</h2>
        <label className="form-field">
          Record type
          <select value={recordType} onChange={(event) => setRecordType(event.target.value)}>
            <option value="LAB_RESULT">Lab result</option>
            <option value="CONSULTATION">Consultation</option>
            <option value="PRESCRIPTION">Prescription</option>
            <option value="IMAGING">Imaging</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="form-field">
          Medical PDF or image
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {status && (
          <p className="success-message" role="status">
            {status}
          </p>
        )}
        <button className="button" disabled={!file || busy} onClick={upload}>
          {busy ? "Securing record…" : "Upload and process"}
        </button>
      </section>
    </>
  );
}
