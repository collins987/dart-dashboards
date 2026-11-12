import { apiClient } from "./client";
import type { TrendResponse } from "@/types/api";
import { USE_MOCK_DATA } from "@/lib/constants";
import { mockTrend } from "./mock";

interface TrendParams {
  companyIds?: string[];
  year: number;
  granularity?: "month" | "quarter";
  includePriorYear?: boolean;
}

export async function getTrend(params: TrendParams): Promise<TrendResponse> {
  if (USE_MOCK_DATA) {
    return mockTrend(
      params.companyIds,
      params.year,
      params.granularity ?? "month",
      params.includePriorYear ?? false
    );
  }
  const { data } = await apiClient.get<TrendResponse>("/financials/trend", {
    params: {
      companyIds: params.companyIds?.join(",") || undefined,
      year: params.year,
      granularity: params.granularity || "month",
      includePriorYear: params.includePriorYear || false,
    },
  });
  return data;
}
