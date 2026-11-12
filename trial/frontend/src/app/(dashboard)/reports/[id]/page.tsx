"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { DataTable, type Column } from "@/components/tables/DataTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useReport } from "@/hooks/useReports"
import type { ReportRow } from "@/types/api"
import { formatCurrency } from "@/lib/utils"

const columns: Column<ReportRow>[] = [
  { key: "account", header: "Account", render: (r) => r.account },
  { key: "label", header: "Label", render: (r) => r.label },
  { key: "amount", header: "Amount", render: (r) => formatCurrency(r.amount), align: "right" },
]

// useParams() must sit inside Suspense under Cache Components.
export default function ReportDetailPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <ReportDetail />
    </Suspense>
  )
}

function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: report, error } = useReport(id)

  if (error) return <p className="text-sm text-destructive">Could not load report: {error.message}</p>
  if (!report) return <p className="text-sm text-muted-foreground">Loading…</p>

  const total = report.rows.reduce((sum, r) => sum + r.amount, 0)
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{report.title}</h2>
        <p className="text-sm text-muted-foreground">{report.period}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatCurrency(total)}</p>
        </CardContent>
      </Card>
      <DataTable columns={columns} rows={report.rows} getRowId={(r) => r.account} />
    </div>
  )
}
