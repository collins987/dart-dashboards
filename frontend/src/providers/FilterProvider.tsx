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
import { MONTH_LABELS_FULL } from "@/data";

interface FilterContextValue {
  filters: FilterState;
  pending: FilterState;
  setCompany: (id: string | null) => void;
  setYear: (year: number) => void;
  setQuarter: (q: number | null) => void;
  setMonth: (m: number | null) => void;
  applyFilters: () => void;
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
  const [pending, setPending] = useState<FilterState>(filters);

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
    setPending((prev) => ({ ...prev, year: latestYear }));
  }, [latestYear]);

  // Keep the URL in step with the applied filters so refresh and links keep them.
  useEffect(() => {
    const query = filtersToParams(filters).toString();
    if (query === params.toString()) return;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filters, params, pathname, router]);

  // Company is a scope choice, so it applies immediately to both states.
  const setCompany = useCallback((id: string | null) => {
    const companyId = id ?? GROUP_COMPANY_ID;
    setPending((prev) => ({ ...prev, companyId }));
    setFilters((prev) => ({ ...prev, companyId }));
  }, []);

  const setYear = useCallback((year: number) => {
    setPending((prev) => ({ ...prev, year }));
  }, []);

  const setQuarter = useCallback((quarter: number | null) => {
    setPending((prev) => ({ ...prev, quarter, month: null }));
  }, []);

  const setMonth = useCallback((month: number | null) => {
    setPending((prev) => ({ ...prev, month, quarter: null }));
  }, []);

  const applyFilters = useCallback(() => {
    setFilters(pending);
  }, [pending]);

  const showLatestPeriod = useCallback(() => {
    if (latestYear === null) return;
    const next = { year: latestYear, quarter: null, month: null };
    setPending((prev) => ({ ...prev, ...next }));
    setFilters((prev) => ({ ...prev, ...next }));
  }, [latestYear]);

  const latestPeriodLabel =
    latest !== null
      ? `Jan – ${MONTH_LABELS_FULL[latest.month - 1]} ${latest.year}`
      : null;

  const value = useMemo(
    () => ({
      filters,
      pending,
      setCompany,
      setYear,
      setQuarter,
      setMonth,
      applyFilters,
      showLatestPeriod,
      latestPeriodLabel,
    }),
    [filters, pending, setCompany, setYear, setQuarter, setMonth, applyFilters, showLatestPeriod, latestPeriodLabel]
  );

  if (!mounted) return null;

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}
