"use client"

import Link from "next/link"
import { BarChart } from "@/components/charts/BarChart"
import { DataTable, type Column } from "@/components/tables/DataTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useKpis, useReports } from "@/hooks/useReports"
import type { KpiMetric, ReportSummary } from "@/types/api"
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/utils"

function formatKpi(m: KpiMetric) {
  if (m.format === "currency") return formatCurrency(m.value)
  if (m.format === "percent") return formatPercent(m.value)
  return formatNumber(m.value)
}

const columns: Column<ReportSummary>[] = [
  {
    key: "title",
    header: "Report",
    render: (r) => (
      <Link href={`/reports/${r.id}`} className="font-medium text-primary hover:underline">
        {r.title}
      </Link>
    ),
  },
  { key: "period", header: "Period", render: (r) => r.period },
  { key: "updated", header: "Updated", render: (r) => formatDate(r.updatedAt), align: "right" },
]

export default function DashboardPage() {
  const kpis = useKpis()
  const reports = useReports()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      {kpis.error && (
        <p className="text-sm text-destructive">Could not load KPIs: {kpis.error.message}</p>
      )}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(kpis.data ?? []).map((m) => (
          <Card key={m.label}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">{m.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatKpi(m)}</p>
              <p className={m.change >= 0 ? "text-sm text-emerald-600" : "text-sm text-rose-600"}>
                {m.change >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(m.change))} vs last period
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {kpis.data && (
        <Card>
          <CardHeader>
            <CardTitle>KPI overview</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={kpis.data.map((m) => ({ label: m.label, value: m.value }))} />
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Recent reports</h3>
        {reports.error && (
          <p className="text-sm text-destructive">Could not load reports: {reports.error.message}</p>
        )}
        <DataTable
          columns={columns}
          rows={(reports.data ?? []).slice(0, 10)}
          getRowId={(r) => r.id}
        />
      </section>
    </div>
  )
}
