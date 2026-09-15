// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTimelineFilters } from "@/hooks/use-timeline-filters";
import type { TimelineEvent } from "@/lib/api/generated/types";

function event(overrides: Partial<TimelineEvent>): TimelineEvent {
  return {
    id: "evt-1",
    eventType: "LAB_RESULT",
    occurredAt: "2025-04-03T00:00:00Z",
    certainty: "confirmed",
    sourceKind: "provider",
    selfReported: false,
    interpretation: { display: "Haemoglobin 13.8 g/dL" },
    reviewStatus: "ACCEPTED",
    citations: [],
    ...overrides,
  };
}

const events: TimelineEvent[] = [
  event({
    id: "e1",
    eventType: "LAB_RESULT",
    certainty: "confirmed",
    reviewStatus: "ACCEPTED",
    interpretation: { display: "Haemoglobin 13.8 g/dL" },
  }),
  event({
    id: "e2",
    eventType: "MEDICATION",
    certainty: "probable",
    reviewStatus: "PENDING_REVIEW",
    interpretation: { display: "Started amoxicillin" },
  }),
  event({
    id: "e3",
    eventType: "ALLERGY",
    certainty: "confirmed",
    reviewStatus: "REJECTED",
    interpretation: { display: "Penicillin allergy" },
  }),
];

describe("useTimelineFilters", () => {
  it("returns every event unfiltered by default", () => {
    const { result } = renderHook(() => useTimelineFilters(events));
    expect(result.current.filtered).toHaveLength(3);
    expect(result.current.isFiltering).toBe(false);
  });

  it("derives filter option lists from the events actually present", () => {
    const { result } = renderHook(() => useTimelineFilters(events));
    expect(result.current.eventTypes).toEqual(["ALLERGY", "LAB_RESULT", "MEDICATION"]);
    expect(result.current.certainties).toEqual(["confirmed", "probable"]);
    expect(result.current.reviewStatuses).toEqual(["ACCEPTED", "PENDING_REVIEW", "REJECTED"]);
  });

  it("filters by event type", () => {
    const { result } = renderHook(() => useTimelineFilters(events));
    act(() => result.current.setFilters((previous) => ({ ...previous, eventType: "MEDICATION" })));
    expect(result.current.filtered.map((event) => event.id)).toEqual(["e2"]);
    expect(result.current.isFiltering).toBe(true);
  });

  it("filters by certainty and review status together", () => {
    const { result } = renderHook(() => useTimelineFilters(events));
    act(() =>
      result.current.setFilters((previous) => ({
        ...previous,
        certainty: "confirmed",
        reviewStatus: "REJECTED",
      })),
    );
    expect(result.current.filtered.map((event) => event.id)).toEqual(["e3"]);
  });

  it("filters by free-text search over the display text", () => {
    const { result } = renderHook(() => useTimelineFilters(events));
    act(() => result.current.setFilters((previous) => ({ ...previous, search: "amoxicillin" })));
    expect(result.current.filtered.map((event) => event.id)).toEqual(["e2"]);
  });

  it("returns no results when filters exclude every event", () => {
    const { result } = renderHook(() => useTimelineFilters(events));
    act(() =>
      result.current.setFilters((previous) => ({
        ...previous,
        eventType: "ALLERGY",
        reviewStatus: "ACCEPTED",
      })),
    );
    expect(result.current.filtered).toHaveLength(0);
  });

  it("handles an empty or undefined event list without throwing", () => {
    const { result: withUndefined } = renderHook(() => useTimelineFilters(undefined));
    expect(withUndefined.current.filtered).toEqual([]);
    const { result: withEmpty } = renderHook(() => useTimelineFilters([]));
    expect(withEmpty.current.filtered).toEqual([]);
  });
});
