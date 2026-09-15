"use client";
import { Search } from "lucide-react";
import type { TimelineFilterState } from "@/hooks/use-timeline-filters";

type Props = {
  filters: TimelineFilterState;
  setFilters: (updater: (previous: TimelineFilterState) => TimelineFilterState) => void;
  eventTypes: string[];
  certainties: string[];
  reviewStatuses: string[];
  matchCount: number;
  totalCount: number;
  all: string;
};

export function TimelineFilterBar({
  filters,
  setFilters,
  eventTypes,
  certainties,
  reviewStatuses,
  matchCount,
  totalCount,
  all,
}: Props) {
  return (
    <div className="filter-bar" role="search" aria-label="Filter timeline events">
      <label className="search-input">
        <Search size={15} />
        <input
          type="search"
          placeholder="Search event type or description…"
          value={filters.search}
          onChange={(event) =>
            setFilters((previous) => ({ ...previous, search: event.target.value }))
          }
          aria-label="Search timeline events"
        />
      </label>
      <label className="filter-select">
        Type
        <select
          value={filters.eventType}
          onChange={(event) =>
            setFilters((previous) => ({ ...previous, eventType: event.target.value }))
          }
          aria-label="Filter by event type"
        >
          <option value={all}>All types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="filter-select">
        Certainty
        <select
          value={filters.certainty}
          onChange={(event) =>
            setFilters((previous) => ({ ...previous, certainty: event.target.value }))
          }
          aria-label="Filter by certainty"
        >
          <option value={all}>All</option>
          {certainties.map((certainty) => (
            <option key={certainty} value={certainty}>
              {certainty}
            </option>
          ))}
        </select>
      </label>
      <label className="filter-select">
        Status
        <select
          value={filters.reviewStatus}
          onChange={(event) =>
            setFilters((previous) => ({ ...previous, reviewStatus: event.target.value }))
          }
          aria-label="Filter by review status"
        >
          <option value={all}>All</option>
          {reviewStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <span>
        {matchCount} of {totalCount}
      </span>
    </div>
  );
}
