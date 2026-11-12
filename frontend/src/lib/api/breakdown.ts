import { apiClient } from "./client";
import type { BreakdownResponse } from "@/types/api";

interface BreakdownParams {
  type: "revenue" | "expense";
  companyIds?: string[];
  year: number;
  quarter?: number | null;
  month?: number | null;
  top?: number;
}

export async function getBreakdown(params: BreakdownParams): Promise<BreakdownResponse> {
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
