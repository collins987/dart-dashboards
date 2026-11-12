import { apiClient } from "./client";
import type { PeriodsResponse } from "@/types/api";

export async function getPeriods(): Promise<PeriodsResponse> {
  const { data } = await apiClient.get<PeriodsResponse>("/periods");
  return data;
}
