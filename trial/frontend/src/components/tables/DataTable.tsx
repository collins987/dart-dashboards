import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: "left" | "right"
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
}) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="min-w-full divide-y text-sm">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-4 py-2 font-medium text-muted-foreground",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-muted-foreground">
                No rows.
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-2", c.align === "right" && "text-right tabular-nums")}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
