"use client"

import { getCompanies } from "@/lib/api/companies"
import { useApi } from "./useApi"

export function useCompanies() {
  return useApi(getCompanies, [])
}
