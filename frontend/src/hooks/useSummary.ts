import { useQuery } from "@tanstack/react-query";
import { getSummary } from "@/lib/api/summary";
import type { FilterState } from "@/types/api";
import { GROUP_COMPANY_ID } from "@/lib/constants";

export function useSummary(filters: FilterState) {
  const companyIds =
    filters.companyId && filters.companyId !== GROUP_COMPANY_ID
      ? [filters.companyId]
      : undefined;

  return useQuery({
    queryKey: ["summary", filters],
    queryFn: () =>
      getSummary({
        companyIds,
        year: filters.year,
        quarter: filters.quarter,
        month: filters.month,
      }),
  });
}
