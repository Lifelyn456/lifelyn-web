"use client";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/auth";
import { PageHeading } from "@/components/page-heading";
import { Failure, Loading } from "@/components/live-states";

type Event = { id: string; action: string; resourceType: string; purpose?: string; requestId: string; occurredAt: string; actor: { role: string; provider?: { displayName: string } | null } };
export default function Page() { const query = useQuery({ queryKey: ["audit"], queryFn: () => apiRequest<Event[]>("/patients/me/audit") }); if (query.isPending) return <Loading />; if (query.error) return <Failure error={query.error} />; return <><PageHeading eyebrow="APPEND-ONLY ACCESS HISTORY" title="Your activity, accounted for." description="Sensitive record, timeline, consent, and conversation access is recorded by the API before data is returned." /><section className="panel audit-panel">{query.data.length ? query.data.map((event) => <div className="audit-row" key={event.id}><span className="record-icon"><ShieldCheck /></span><div><strong>{event.action} · {event.resourceType}</strong><span>{event.actor.provider?.displayName ?? event.actor.role} · {event.purpose ?? "No purpose supplied"}</span></div><time>{new Date(event.occurredAt).toLocaleString()}<br />Request {event.requestId.slice(0, 8)}</time></div>) : <div className="empty-state"><p>No access events yet.</p></div>}</section></>; }
