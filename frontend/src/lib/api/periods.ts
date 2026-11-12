import { apiClient } from "./client";
import type { PeriodsResponse } from "@/types/api";
import { USE_MOCK_DATA } from "@/lib/constants";
import { mockPeriods } from "./mock";

export async function getPeriods(): Promise<PeriodsResponse> {
  if (USE_MOCK_DATA) return mockPeriods;
  const { data } = await apiClient.get<PeriodsResponse>("/periods");
  return data;
}
