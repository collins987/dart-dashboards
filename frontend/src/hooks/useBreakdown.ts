import { useQuery } from "@tanstack/react-query";
import { getBreakdown } from "@/lib/api/breakdown";
import type { FilterState } from "@/types/api";
import { GROUP_COMPANY_ID } from "@/lib/constants";

export function useBreakdown(filters: FilterState, type: "revenue" | "expense") {
  const companyIds =
    filters.companyId && filters.companyId !== GROUP_COMPANY_ID
      ? [filters.companyId]
      : undefined;

  return useQuery({
    queryKey: ["breakdown", filters, type],
    queryFn: () =>
      getBreakdown({
        type,
        companyIds,
        year: filters.year,
        quarter: filters.quarter,
        month: filters.month,
      }),
  });
}
