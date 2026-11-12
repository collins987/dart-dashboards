"use client"

import { useEffect, useState } from "react"

// Generic client-side fetch hook. Pass a stable fetcher (module-level function
// or wrapped in useCallback) and the args that should re-trigger the request.
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetcher()
      .then((r) => active && setData(r))
      .catch((e: Error) => active && setError(e))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading }
}
