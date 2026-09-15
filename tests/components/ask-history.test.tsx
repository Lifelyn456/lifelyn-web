// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AskHistory } from "@/components/chat/ask-history";
import { api } from "@/lib/api/client";
import type { AskAnswer } from "@/lib/api/generated/types";
import { renderWithQuery } from "./test-utils";

vi.mock("@/lib/api/client", () => ({
  api: {
    ask: {
      createConversation: vi.fn(),
      ask: vi.fn(),
    },
  },
}));

const answer: AskAnswer = {
  answer: "2025-04-03: Haemoglobin 13.8 g/dL",
  insufficient_evidence: false,
  safety_notice: "This is a record summary, not a diagnosis or prescription.",
  conflicts: [],
  claims: [
    {
      text: "2025-04-03: Haemoglobin 13.8 g/dL",
      support_status: "SUPPORTED",
      provenance: "record",
      citations: [
        {
          record_version_id: "v1",
          record_id: "rec-1",
          page: 2,
          span_id: "span-1",
          relevance_score: 0.9,
        },
      ],
    },
  ],
};

describe("AskHistory citations", () => {
  beforeEach(() => {
    vi.mocked(api.ask.createConversation).mockResolvedValue({
      id: "conv-1",
      patientId: "me",
      purpose: "patient-history-review",
    });
    vi.mocked(api.ask.ask).mockResolvedValue(answer);
  });

  it("renders a citation link to the source record one click away from the answer", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AskHistory />);

    await user.type(
      screen.getByPlaceholderText(/Ask about a recorded result/),
      "What was my haemoglobin?",
    );
    await user.click(screen.getByRole("button", { name: "Send question" }));

    expect(await screen.findByText(/Haemoglobin 13.8/)).toBeInTheDocument();

    const citationLink = screen.getByRole("link", { name: /Source · page 2/ });
    expect(citationLink).toHaveAttribute("href", "/records/rec-1");
  });

  it("uses the clinician record path when rendered in clinician mode", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AskHistory patientId="patient-9" clinician />);

    await user.type(
      screen.getByPlaceholderText(/Ask about a recorded result/),
      "What was my haemoglobin?",
    );
    await user.click(screen.getByRole("button", { name: "Send question" }));

    const citationLink = await screen.findByRole("link", { name: /Source · page 2/ });
    expect(citationLink).toHaveAttribute("href", "/clinician/patients/patient-9/records/rec-1");
    await waitFor(() =>
      expect(api.ask.createConversation).toHaveBeenCalledWith("patient-9", "clinical-care"),
    );
  });

  it("links a patient-correction claim to the corrected timeline entry instead of a record", async () => {
    vi.mocked(api.ask.ask).mockResolvedValue({
      ...answer,
      claims: [
        {
          ...answer.claims[0],
          citations: [],
          fact_id: "event-42",
          provenance: "patient-correction",
          occurred_at: "2025-04-03T00:00:00Z",
          source_kind: "patient",
        },
      ],
    });
    const user = userEvent.setup();
    renderWithQuery(<AskHistory />);

    await user.type(screen.getByPlaceholderText(/Ask about a recorded result/), "migraine history");
    await user.click(screen.getByRole("button", { name: "Send question" }));

    const correctionLink = await screen.findByRole("link", { name: "Patient correction" });
    expect(correctionLink).toHaveAttribute("href", "/timeline#event-event-42");
  });
});
