"use client";
import Link from "next/link";
import { Activity, Files, ShieldCheck, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/auth";
import type { Account, RecordSummary, TimelineEvent } from "@/types/api";
import { Failure, Loading } from "@/components/live-states";

export default function Dashboard() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiRequest<Account>("/me") });
  const records = useQuery({
    queryKey: ["records", "me"],
    queryFn: () => apiRequest<RecordSummary[]>("/patients/me/records"),
  });
  const timeline = useQuery({
    queryKey: ["timeline", "me"],
    queryFn: () => apiRequest<TimelineEvent[]>("/patients/me/timeline"),
  });
  const grants = useQuery({
    queryKey: ["consents"],
    queryFn: () => apiRequest<Array<{ status: string }>>("/patients/me/consents"),
  });
  if (me.isPending || records.isPending || timeline.isPending || grants.isPending)
    return <Loading />;
  const error = me.error ?? records.error ?? timeline.error ?? grants.error;
  if (error) return <Failure error={error} />;
  return (
    <>
      <section className="overview-hero">
        <span className="eyebrow">YOUR LIVE HEALTH MEMORY</span>
        <h1>Welcome, {me.data?.patient?.displayName}.</h1>
        <p>
          Your records, reviewed events, permissions, and evidence are loaded from Lifelyn’s
          protected API.
        </p>
        <Link href="/records/upload" className="button">
          Add a record
        </Link>
      </section>
      <div className="stats-grid">
        <article className="stat-card">
          <Files />
          <h3>{records.data?.length ?? 0} records</h3>
          <p>Encrypted originals</p>
        </article>
        <article className="stat-card">
          <Activity />
          <h3>{timeline.data?.length ?? 0} events</h3>
          <p>Structured history</p>
        </article>
        <article className="stat-card">
          <ShieldCheck />
          <h3>{grants.data?.filter((grant) => grant.status === "ACTIVE").length ?? 0} grants</h3>
          <p>Active permissions</p>
        </article>
      </div>
      <section className="panel ask-card">
        <Sparkles />
        <span className="eyebrow">ASK PATIENT HISTORY</span>
        <h2>Answers stay tied to evidence.</h2>
        <p>Only accepted, authorized events can support an answer.</p>
        <Link href="/ask" className="button">
          Ask my history
        </Link>
      </section>
    </>
  );
}
