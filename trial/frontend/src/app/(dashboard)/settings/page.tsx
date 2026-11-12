"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompanies } from "@/hooks/useCompanies"

export default function SettingsPage() {
  const { data: companies, error } = useCompanies()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>Companies in scope</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive">Could not load companies: {error.message}</p>
          )}
          <ul className="divide-y">
            {(companies ?? []).map((c) => (
              <li key={c.id} className="flex justify-between py-2 text-sm">
                <span>{c.name}</span>
                <span className="text-muted-foreground">{c.currency}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
