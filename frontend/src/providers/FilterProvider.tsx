"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterState } from "@/types/api";
import { GROUP_COMPANY_ID } from "@/lib/constants";
import { filtersFromParams, filtersToParams } from "@/lib/filters";
import { usePeriods } from "@/hooks/usePeriods";
import { yearToDateLabel } from "@/lib/months";

interface FilterContextValue {
  filters: FilterState;
  setCompany: (id: string | null) => void;
  setYear: (year: number) => void;
  setQuarter: (q: number | null) => void;
  setMonth: (m: number | null) => void;
  showLatestPeriod: () => void;
  latestPeriodLabel: string | null;
}

export const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: periods } = usePeriods();

  const latest = periods?.latestClosedPeriod ?? null;
  const latestYear = latest?.year ?? null;

  const [filters, setFilters] = useState<FilterState>(() =>
    filtersFromParams(params, new Date().getFullYear())
  );

  // The URL and query cache only exist in the browser, so the dashboard
  // renders after mount to keep server and client markup identical.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Until the user picks a year, start on the latest closed year from /periods.
  const yearDefaulted = useRef(params.has("year"));
  useEffect(() => {
    if (yearDefaulted.current || latestYear === null) return;
    yearDefaulted.current = true;
    setFilters((prev) => ({ ...prev, year: latestYear }));
  }, [latestYear]);

  // Keep the URL in step with the applied filters so refresh and links keep them.
  useEffect(() => {
    const query = filtersToParams(filters).toString();
    if (query === params.toString()) return;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filters, params, pathname, router]);

  // Every filter applies immediately, so the dashboard updates as the user picks.
  const setCompany = useCallback((id: string | null) => {
    const companyId = id ?? GROUP_COMPANY_ID;
    setFilters((prev) => ({ ...prev, companyId }));
  }, []);

  const setYear = useCallback((year: number) => {
    setFilters((prev) => ({ ...prev, year }));
  }, []);

  // Quarter and month are mutually exclusive, so picking one clears the other.
  const setQuarter = useCallback((quarter: number | null) => {
    setFilters((prev) => ({ ...prev, quarter, month: null }));
  }, []);

  const setMonth = useCallback((month: number | null) => {
    setFilters((prev) => ({ ...prev, month, quarter: null }));
  }, []);

  const showLatestPeriod = useCallback(() => {
    if (latestYear === null) return;
    setFilters((prev) => ({ ...prev, year: latestYear, quarter: null, month: null }));
  }, [latestYear]);

  const latestPeriodLabel =
    latest !== null
      ? yearToDateLabel(latest.year, latest.month)
      : null;

  const value = useMemo(
    () => ({
      filters,
      setCompany,
      setYear,
      setQuarter,
      setMonth,
      showLatestPeriod,
      latestPeriodLabel,
    }),
    [filters, setCompany, setYear, setQuarter, setMonth, showLatestPeriod, latestPeriodLabel]
  );

  if (!mounted) return null;

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}
