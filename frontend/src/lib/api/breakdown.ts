import { apiClient } from "./client";
import type { BreakdownResponse } from "@/types/api";
import { USE_MOCK_DATA } from "@/lib/constants";
import { mockBreakdown } from "./mock";

interface BreakdownParams {
  type: "revenue" | "expense";
  companyIds?: string[];
  year: number;
  quarter?: number | null;
  month?: number | null;
  top?: number;
}

export async function getBreakdown(params: BreakdownParams): Promise<BreakdownResponse> {
  if (USE_MOCK_DATA) {
    return mockBreakdown(
      params.type,
      params.companyIds,
      params.year,
      params.quarter ?? null,
      params.month ?? null
    );
  }
  const { data } = await apiClient.get<BreakdownResponse>("/financials/breakdown", {
    params: {
      type: params.type,
      companyIds: params.companyIds?.join(",") || undefined,
      year: params.year,
      quarter: params.quarter || undefined,
      month: params.month || undefined,
      top: params.top || undefined,
    },
  });
  return data;
}
