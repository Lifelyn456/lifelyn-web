"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { PageHeading } from "@/components/page-heading";
import { Failure, Loading } from "@/components/live-states";
import { TimelineFilterBar } from "@/components/timeline/timeline-filter-bar";
import { useTimelineFilters } from "@/hooks/use-timeline-filters";

export function PatientTimeline({ patientId }: { patientId: string }) {
  const query = useQuery({
    queryKey: ["timeline", patientId],
    queryFn: () => api.timeline.list(patientId),
  });
  const { filters, setFilters, filtered, eventTypes, certainties, reviewStatuses, all } =
    useTimelineFilters(query.data);
  if (query.isPending) return <Loading />;
  if (query.error) return <Failure error={query.error} />;
  return (
    <>
      <PageHeading
        eyebrow="CONSENT-SCOPED TIMELINE"
        title="Authorized patient history."
        description="Expiry and revocation are rechecked by the API on every request."
      />
      {query.data.length > 0 && (
        <TimelineFilterBar
          filters={filters}
          setFilters={setFilters}
          eventTypes={eventTypes}
          certainties={certainties}
          reviewStatuses={reviewStatuses}
          matchCount={filtered.length}
          totalCount={query.data.length}
          all={all}
        />
      )}
      <div className="full-timeline">
        {filtered.map((event) => (
          <article className="timeline-entry" key={event.id}>
            <div className="timeline-date">
              <strong>{new Date(event.occurredAt).toLocaleDateString()}</strong>
            </div>
            <span className="timeline-node" />
            <div className="timeline-entry-card">
              <span className="eyebrow">
                {event.eventType} ·{" "}
                {event.selfReported ? "SELF-REPORTED" : event.sourceKind.toUpperCase()}
              </span>
              <h2>{event.interpretation.display}</h2>
              <div className="timeline-entry-bottom">
                {event.citations.map((citation) => (
                  <Link
                    key={citation.recordVersionId}
                    href={`/clinician/patients/${patientId}/records/${citation.recordId}`}
                  >
                    Source page {citation.page ?? 1}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
