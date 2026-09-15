"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileText, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/auth";
import type { RecordSummary, TimelineEvent } from "@/types/api";
import { PageHeading } from "@/components/page-heading";
import { Failure, Loading } from "@/components/live-states";

export function PatientSummary({ patientId }: { patientId: string }) {
  const records = useQuery({
    queryKey: ["records", patientId],
    queryFn: () => apiRequest<RecordSummary[]>(`/patients/${patientId}/records`),
  });
  const timeline = useQuery({
    queryKey: ["timeline", patientId],
    queryFn: () => apiRequest<TimelineEvent[]>(`/patients/${patientId}/timeline`),
  });
  if (records.isPending || timeline.isPending) return <Loading />;
  const error = records.error ?? timeline.error;
  if (error) return <Failure error={error} />;
  return (
    <>
      <PageHeading
        eyebrow="AUTHORIZED PATIENT WORKSPACE"
        title="Patient summary."
        description="This view contains only resources allowed by the active consent grant."
      />
      <div className="stats-grid">
        <article className="stat-card">
          <FileText />
          <h3>{records.data?.length ?? 0} records</h3>
          <p>Authorized originals</p>
        </article>
        <article className="stat-card">
          <Sparkles />
          <h3>{timeline.data?.length ?? 0} events</h3>
          <p>Authorized history</p>
        </article>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Records</h2>
            <p>Open a cited source after authorization is rechecked.</p>
          </div>
          <Link href={`/clinician/patients/${patientId}/ask`}>Ask history →</Link>
        </div>
        {records.data?.map((record) => (
          <Link
            className="record-list-row"
            href={`/clinician/patients/${patientId}/records/${record.id}`}
            key={record.id}
          >
            <span className="record-icon">
              <FileText />
            </span>
            <div>
              <strong>{record.originalFilename}</strong>
              <span>{record.recordType}</span>
            </div>
            <span className="status-pill">{record.status}</span>
          </Link>
        ))}
      </section>
      <div className="access-actions">
        <Link className="button" href={`/clinician/patients/${patientId}/timeline`}>
          View timeline
        </Link>
        <Link className="button button-outline" href={`/clinician/patients/${patientId}/ask`}>
          Ask Patient History
        </Link>
      </div>
    </>
  );
}
