import { apiClient } from "./client";
import type { CompaniesResponse } from "@/types/api";
import { USE_MOCK_DATA } from "@/lib/constants";
import { mockCompanies } from "./mock";

export async function getCompanies(): Promise<CompaniesResponse> {
  if (USE_MOCK_DATA) return mockCompanies;
  const { data } = await apiClient.get<CompaniesResponse>("/companies");
  return data;
}
