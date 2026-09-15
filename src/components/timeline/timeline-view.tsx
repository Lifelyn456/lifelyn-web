"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileText } from "lucide-react";
import { api } from "@/lib/api/client";
import { PageHeading } from "@/components/page-heading";
import { Failure, Loading } from "@/components/live-states";
import { Button } from "@/components/ui/button";
import { TimelineFilterBar } from "@/components/timeline/timeline-filter-bar";
import { useTimelineFilters } from "@/hooks/use-timeline-filters";

export function TimelineView() {
  const client = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [display, setDisplay] = useState("");
  const query = useQuery({ queryKey: ["timeline", "me"], queryFn: () => api.timeline.list() });
  const { filters, setFilters, filtered, eventTypes, certainties, reviewStatuses, all } =
    useTimelineFilters(query.data);
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "CORRECTED" | "REJECTED" }) =>
      api.timeline.correct(id, {
        reason:
          reason || (status === "ACCEPTED" ? "Patient reviewed extraction" : "Patient correction"),
        fields: display ? { display } : {},
        reviewStatus: status,
      }),
    onSuccess: async () => {
      setEditing(null);
      setReason("");
      setDisplay("");
      await client.invalidateQueries({ queryKey: ["timeline", "me"] });
    },
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <Failure error={query.error} />;
  return (
    <>
      <PageHeading
        eyebrow="EVIDENCE-BACKED HISTORY"
        title="Your health timeline."
        description="Pending extractions require review. Corrections never alter the encrypted original or its hash."
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
        {query.data.length === 0 ? (
          <section className="panel empty-state">
            <FileText />
            <h2>No extracted events yet</h2>
            <p>Upload a record and wait for the ingestion worker.</p>
          </section>
        ) : filtered.length === 0 ? (
          <section className="panel empty-state">
            <FileText />
            <h2>No events match these filters</h2>
            <p>Try clearing the search or filter selections above.</p>
          </section>
        ) : (
          filtered.map((event) => (
            <article className="timeline-entry" id={`event-${event.id}`} key={event.id}>
              <div className="timeline-date">
                <strong>
                  {new Date(event.occurredAt).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                  })}
                </strong>
                <span>{new Date(event.occurredAt).getFullYear()}</span>
              </div>
              <span className="timeline-node" />
              <div className="timeline-entry-card">
                <span className="eyebrow">
                  {event.eventType.replaceAll("_", " ")} ·{" "}
                  {event.selfReported ? "SELF-REPORTED" : event.sourceKind.toUpperCase()}
                </span>
                <h2>{event.interpretation.display ?? "Structured clinical event"}</h2>
                <p>
                  {event.certainty} · {event.reviewStatus.replaceAll("_", " ")}
                </p>
                <div className="timeline-entry-bottom">
                  {event.citations.map((citation) => (
                    <Link key={citation.recordVersionId} href={`/records/${citation.recordId}`}>
                      Source page {citation.page ?? 1}
                    </Link>
                  ))}
                </div>
                {event.reviewStatus === "PENDING_REVIEW" && (
                  <div className="access-actions">
                    <Button onClick={() => update.mutate({ id: event.id, status: "ACCEPTED" })}>
                      <Check size={15} /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(event.id);
                        setDisplay(event.interpretation.display ?? "");
                      }}
                    >
                      Correct
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => update.mutate({ id: event.id, status: "REJECTED" })}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {editing === event.id && (
                  <div className="review-panel">
                    <label className="form-field">
                      Corrected interpretation
                      <textarea value={display} onChange={(e) => setDisplay(e.target.value)} />
                    </label>
                    <label className="form-field">
                      Reason
                      <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
                    </label>
                    <Button
                      disabled={!reason.trim() || !display.trim()}
                      onClick={() => update.mutate({ id: event.id, status: "CORRECTED" })}
                    >
                      Save correction
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
      {update.error && (
        <p className="error-message" role="alert">
          {update.error.message}
        </p>
      )}
    </>
  );
}
