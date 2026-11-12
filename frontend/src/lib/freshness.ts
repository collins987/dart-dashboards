/**
 * Turns a response's `dataAsOf` timestamp into a human "how fresh is this" read
 * for the header badge. Pure and deterministic: callers pass `now` in tests.
 */

/** Data at or under this age (in days) counts as fresh; older is stale. */
export const STALE_AFTER_DAYS = 7;

export type FreshnessStatus = "fresh" | "stale" | "unknown";

export interface Freshness {
  status: FreshnessStatus;
  /** Short relative phrase, e.g. "just now", "3 hours ago", "5 days ago". */
  relative: string;
  /** Full timestamp for a tooltip, e.g. "9 Nov 2026, 07:16". */
  absolute: string | null;
}

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
}

function relativeLabel(diffMs: number): string {
  if (diffMs < 0) return "just now"; // clock skew: treat future timestamps as current
  if (diffMs < MS_PER_MINUTE) return "just now";
  if (diffMs < MS_PER_HOUR) return plural(Math.floor(diffMs / MS_PER_MINUTE), "minute");
  if (diffMs < MS_PER_DAY) return plural(Math.floor(diffMs / MS_PER_HOUR), "hour");
  return plural(Math.floor(diffMs / MS_PER_DAY), "day");
}

function absoluteLabel(date: Date): string {
  // Date only, e.g. "9 Nov 2026".
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function freshnessOf(
  dataAsOf: string | null | undefined,
  now: Date = new Date()
): Freshness {
  if (!dataAsOf) {
    return { status: "unknown", relative: "Updated time unknown", absolute: null };
  }

  const asOf = new Date(dataAsOf);
  if (Number.isNaN(asOf.getTime())) {
    return { status: "unknown", relative: "Updated time unknown", absolute: null };
  }

  const diffMs = now.getTime() - asOf.getTime();
  const ageDays = diffMs / MS_PER_DAY;
  const status: FreshnessStatus = ageDays > STALE_AFTER_DAYS ? "stale" : "fresh";

  return {
    status,
    relative: relativeLabel(diffMs),
    absolute: absoluteLabel(asOf),
  };
}
