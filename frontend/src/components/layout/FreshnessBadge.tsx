"use client";

import { freshnessOf } from "@/lib/freshness";

interface FreshnessBadgeProps {
  /** The `dataAsOf` timestamp from any financial response. */
  dataAsOf: string | null | undefined;
}

export function FreshnessBadge({ dataAsOf }: FreshnessBadgeProps) {
  const { absolute } = freshnessOf(dataAsOf);

  return (
    <p className="mt-1 text-[11px] text-muted">
      {absolute ? `Last updated on ${absolute}` : "Last updated date unknown"}
    </p>
  );
}
