"use client";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/page-heading";
import { Failure, Loading } from "@/components/live-states";
import { apiRequest } from "@/lib/auth";
import type { RecordSummary } from "@/types/api";

export function RecordList() {
  const query = useQuery({
    queryKey: ["records", "me"],
    queryFn: () => apiRequest<RecordSummary[]>("/patients/me/records"),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <Failure error={query.error} />;
  return (
    <>
      <PageHeading
        eyebrow="ENCRYPTED ORIGINALS"
        title="Your records."
        description="Each original is malware-scanned, envelope-encrypted, hash-verified, and kept immutable."
      />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Record library</h2>
            <p>{query.data.length} live records</p>
          </div>
          <Link href="/records/upload" className="button">
            Upload record
          </Link>
        </div>
        {query.data.length === 0 ? (
          <div className="empty-state">
            <FileText />
            <h2>No records yet</h2>
            <p>Upload a PDF or clinical image to begin.</p>
          </div>
        ) : (
          query.data.map((record) => (
            <Link className="record-list-row" href={`/records/${record.id}`} key={record.id}>
              <span className="record-icon">
                <FileText />
              </span>
              <div>
                <strong>{record.originalFilename}</strong>
                <span>
                  {record.recordType} · {new Date(record.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className="status-pill">{record.status.replaceAll("_", " ")}</span>
            </Link>
          ))
        )}
      </section>
    </>
  );
}
