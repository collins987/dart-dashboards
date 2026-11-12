import { useQuery } from "@tanstack/react-query";
import { getTrend } from "@/lib/api/trend";
import type { FilterState } from "@/types/api";
import { GROUP_COMPANY_ID } from "@/lib/constants";

export function useTrend(
  filters: FilterState,
  granularity: "month" | "quarter" = "month",
  includePriorYear = false
) {
  const companyIds =
    filters.companyId && filters.companyId !== GROUP_COMPANY_ID
      ? [filters.companyId]
      : undefined;

  return useQuery({
    queryKey: ["trend", filters.companyId, filters.year, granularity, includePriorYear],
    queryFn: () =>
      getTrend({
        companyIds,
        year: filters.year,
        granularity,
        includePriorYear,
      }),
  });
}
