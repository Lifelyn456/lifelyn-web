import { useMemo, useState } from "react";
import type { TimelineEvent } from "@/lib/api/generated/types";

export type TimelineFilterState = {
  search: string;
  eventType: string;
  certainty: string;
  reviewStatus: string;
};

const ALL = "ALL";

export const defaultTimelineFilters: TimelineFilterState = {
  search: "",
  eventType: ALL,
  certainty: ALL,
  reviewStatus: ALL,
};

/** Client-side filtering over an already-fetched, already-authorized timeline — options are
 * derived from the events actually present so a filter never offers a choice with no matches. */
export function useTimelineFilters(events: TimelineEvent[] | undefined) {
  const [filters, setFilters] = useState<TimelineFilterState>(defaultTimelineFilters);

  const eventTypes = useMemo(
    () => [...new Set((events ?? []).map((event) => event.eventType))].sort(),
    [events],
  );
  const certainties = useMemo(
    () => [...new Set((events ?? []).map((event) => event.certainty))].sort(),
    [events],
  );
  const reviewStatuses = useMemo(
    () => [...new Set((events ?? []).map((event) => event.reviewStatus))].sort(),
    [events],
  );

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (events ?? []).filter((event) => {
      if (filters.eventType !== ALL && event.eventType !== filters.eventType) return false;
      if (filters.certainty !== ALL && event.certainty !== filters.certainty) return false;
      if (filters.reviewStatus !== ALL && event.reviewStatus !== filters.reviewStatus) return false;
      if (
        search &&
        !(event.interpretation.display ?? "").toLowerCase().includes(search) &&
        !event.eventType.toLowerCase().includes(search)
      )
        return false;
      return true;
    });
  }, [events, filters]);

  const isFiltering =
    filters.search.trim() !== "" ||
    filters.eventType !== ALL ||
    filters.certainty !== ALL ||
    filters.reviewStatus !== ALL;

  return {
    filters,
    setFilters,
    filtered,
    eventTypes,
    certainties,
    reviewStatuses,
    isFiltering,
    all: ALL,
  };
}
