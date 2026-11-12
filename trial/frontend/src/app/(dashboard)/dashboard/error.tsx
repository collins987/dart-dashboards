"use client"

import { Button } from "@/components/ui/button"

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-3 rounded-xl border border-destructive/40 p-6">
      <p className="font-medium text-destructive">Could not load the dashboard.</p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
