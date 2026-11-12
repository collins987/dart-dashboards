"use client"

import type { ReactNode } from "react"

// Global client providers (theme, query client, etc.) go here as they are added.
export function AppProviders({ children }: { children: ReactNode }) {
  return <>{children}</>
}
