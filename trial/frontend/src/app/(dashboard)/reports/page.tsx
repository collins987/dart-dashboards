"use client"

import Link from "next/link"
import { DataTable, type Column } from "@/components/tables/DataTable"
import { useReports } from "@/hooks/useReports"
import type { ReportSummary } from "@/types/api"
import { formatDate } from "@/lib/utils"

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

export default function ReportsPage() {
  const { data, error } = useReports()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Reports</h2>
      {error && <p className="text-sm text-destructive">Could not load reports: {error.message}</p>}
      <DataTable columns={columns} rows={data ?? []} getRowId={(r) => r.id} />
    </div>
  )
}
