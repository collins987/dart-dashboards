import { apiClient } from "./client";
import type { SummaryResponse } from "@/types/api";

interface SummaryParams {
  companyIds?: string[];
  year: number;
  quarter?: number | null;
  month?: number | null;
}

export async function getSummary(params: SummaryParams): Promise<SummaryResponse> {
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
