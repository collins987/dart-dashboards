import { apiClient } from "./client";
import type { CompaniesResponse } from "@/types/api";

export async function getCompanies(): Promise<CompaniesResponse> {
  const { data } = await apiClient.get<CompaniesResponse>("/companies");
  return data;
}
