"use client"

import { getKpis, getReport, getReports } from "@/lib/api/reports"
import { useApi } from "./useApi"

export function useReports() {
  return useApi(getReports, [])
}

export function useReport(id: string) {
  return useApi(() => getReport(id), [id])
}

export function useKpis() {
  return useApi(getKpis, [])
}
