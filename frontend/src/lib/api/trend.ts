import { apiClient } from "./client";
import type { TrendResponse } from "@/types/api";

interface TrendParams {
  companyIds?: string[];
  year: number;
  granularity?: "month" | "quarter";
  includePriorYear?: boolean;
}

export async function getTrend(params: TrendParams): Promise<TrendResponse> {
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
