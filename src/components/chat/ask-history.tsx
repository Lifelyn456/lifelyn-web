"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { Send, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { AskAnswer } from "@/lib/api/generated/types";
import { PageHeading } from "@/components/page-heading";

export function AskHistory({
  patientId = "me",
  clinician = false,
}: {
  patientId?: string;
  clinician?: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<string | null>(null);
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const ask = useMutation({
    mutationFn: async (value: string) => {
      let id = conversation;
      if (!id) {
        const created = await api.ask.createConversation(
          patientId,
          clinician ? "clinical-care" : "patient-history-review",
        );
        id = created.id;
        setConversation(id);
      }
      return api.ask.ask(patientId, id, value);
    },
    onSuccess: (data) => setAnswer(data),
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (question.trim()) ask.mutate(question.trim());
  }
  const recordHref = (recordId: string) =>
    clinician ? `/clinician/patients/${patientId}/records/${recordId}` : `/records/${recordId}`;
  return (
    <>
      <PageHeading
        eyebrow="AUTHORIZED EVIDENCE ONLY"
        title="Ask Patient History."
        description="Every material claim must link back to an allowed source record. Diagnosis and prescribing requests are refused."
      />
      <section className="panel chat-panel">
        <div className="chat-heading">
          <Sparkles />
          <div>
            <h2>Evidence-backed history</h2>
            <p>
              {clinician
                ? "This conversation is re-authorized on every request."
                : "Only accepted events in your records can support an answer."}
            </p>
          </div>
        </div>
        {answer && (
          <div className="chat-messages">
            <div className="assistant-message">
              <span className="record-icon">
                <Sparkles />
              </span>
              <div>
                <p>{answer.answer}</p>
                {answer.conflicts.map((conflict) => (
                  <p className="error-message" key={conflict}>
                    {conflict}
                  </p>
                ))}
                <small>{answer.safety_notice}</small>
                <div className="answer-sources">
                  {answer.claims
                    .flatMap((claim) => claim.citations)
                    .map((citation, index) =>
                      citation.record_id ? (
                        <Link
                          href={recordHref(citation.record_id)}
                          key={`${citation.record_version_id}-${index}`}
                        >
                          Source · page {citation.page}
                        </Link>
                      ) : null,
                    )}
                  {answer.claims
                    .filter((claim) => claim.provenance === "patient-correction" && claim.fact_id)
                    .map((claim) => (
                      <Link
                        href={`${clinician ? `/clinician/patients/${patientId}/timeline` : "/timeline"}#event-${claim.fact_id}`}
                        key={`correction-${claim.fact_id}`}
                      >
                        Patient correction
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <form className="chat-input" onSubmit={submit}>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about a recorded result, medication, allergy, or event…"
            maxLength={2000}
          />
          <button aria-label="Send question" disabled={ask.isPending || !question.trim()}>
            <Send />
          </button>
        </form>
        {ask.error && (
          <p className="error-message" role="alert">
            {ask.error.message}
          </p>
        )}
        <p className="chat-disclaimer">
          Lifelyn retrieves recorded history; it does not diagnose or prescribe.
        </p>
      </section>
    </>
  );
}
