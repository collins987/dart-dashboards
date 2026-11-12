import { apiGet } from "./client"
import type { KpiMetric, ReportDetail, ReportSummary } from "@/types/api"

export const getReports = () => apiGet<ReportSummary[]>("/reports")

export const getReport = (id: string) => apiGet<ReportDetail>(`/reports/${id}`)

export const getKpis = () => apiGet<KpiMetric[]>("/reports/kpis")
