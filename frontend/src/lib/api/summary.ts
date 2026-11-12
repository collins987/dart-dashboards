import { apiClient } from "./client";
import type { SummaryResponse } from "@/types/api";
import { USE_MOCK_DATA } from "@/lib/constants";
import { mockSummary } from "./mock";

interface SummaryParams {
  companyIds?: string[];
  year: number;
  quarter?: number | null;
  month?: number | null;
}

export async function getSummary(params: SummaryParams): Promise<SummaryResponse> {
  if (USE_MOCK_DATA) {
    return mockSummary(
      params.companyIds,
      params.year,
      params.quarter ?? null,
      params.month ?? null
    );
  }
  const { data } = await apiClient.get<SummaryResponse>("/financials/summary", {
    params: {
      companyIds: params.companyIds?.join(",") || undefined,
      year: params.year,
      quarter: params.quarter || undefined,
      month: params.month || undefined,
    },
  });
  return data;
}
