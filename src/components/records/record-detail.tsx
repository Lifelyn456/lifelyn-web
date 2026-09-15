"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiBlob, apiRequest } from "@/lib/auth";
import { Failure, Loading } from "@/components/live-states";

type Detail = { id: string; originalFilename: string; mimeType: string; recordType: string; sourceType: string; status: string; sourceUrl: string; versions: Array<{ id: string; sha256: string; sizeBytes: number; createdAt: string }> };
export function RecordDetail({ id, patientId = "me", backHref = "/records" }: { id: string; patientId?: string; backHref?: string }) {
  const query = useQuery({ queryKey: ["record", patientId, id], queryFn: () => apiRequest<Detail>(`/patients/${patientId}/records/${id}`) });
  const [source, setSource] = useState(""); const [error, setError] = useState("");
  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);
  if (query.isPending) return <Loading />; if (query.error) return <Failure error={query.error} />;
  const record = query.data; const version = record.versions[0];
  async function openSource() { try { const url = URL.createObjectURL(await apiBlob(record.sourceUrl)); setSource((old) => { if (old) URL.revokeObjectURL(old); return url; }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Source could not be opened."); } }
  return <><Link href={backHref} className="back-link">← Back to records</Link><div className="source-layout"><section className="panel source-document"><div className="source-toolbar"><strong>{record.originalFilename}</strong><button className="text-button" onClick={openSource}>Open decrypted source <ExternalLink size={15} /></button></div>{source ? record.mimeType === "application/pdf" ? <iframe title={record.originalFilename} src={source} style={{ width: "100%", minHeight: 700, border: 0 }} /> : <img src={source} alt={`Source record ${record.originalFilename}`} style={{ maxWidth: "100%" }} /> : <div className="empty-state"><ShieldCheck /><p>The source is decrypted only after this authorized request.</p>{error && <p role="alert">{error}</p>}</div>}</section><aside className="panel review-panel"><span className="eyebrow">IMMUTABLE ORIGINAL</span><h2>{record.recordType.replaceAll("_", " ")}</h2><p>Status: {record.status.replaceAll("_", " ")}</p>{version && <><p className="source-reference">SHA-256</p><code style={{ overflowWrap: "anywhere" }}>{version.sha256}</code><p>{version.sizeBytes.toLocaleString()} bytes</p></>}</aside></div></>;
}
