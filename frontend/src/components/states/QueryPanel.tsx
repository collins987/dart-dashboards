"use client";

import { useEffect, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { useFilters } from "@/hooks/useFilters";
import { isNormalisedError } from "@/lib/api/client";
import { GROUP_COMPANY_ID } from "@/lib/constants";

type QueryState<T> = Pick<UseQueryResult<T, unknown>, "data" | "isPending" | "isError" | "error" | "refetch">;

const HANDLED_CODES = ["FORBIDDEN_COMPANY", "DATA_NOT_AVAILABLE", "UNAUTHENTICATED"];

interface QueryPanelProps<T> {
  query: QueryState<T>;
  /** Height of the placeholder shown while loading, so the layout does not shift. */
  height: number;
  children: (data: T) => ReactNode;
}

/**
 * Renders one data-backed card or chart. Each panel handles its own loading,
 * "no data for this period", company access and failure states, so one failing
 * request never blanks the rest of the page.
 */
export function QueryPanel<T>({ query, height, children }: QueryPanelProps<T>) {
  const { setCompany, showLatestPeriod, latestPeriodLabel } = useFilters();

  const error = isNormalisedError(query.error) ? query.error : null;
  const isForbidden = error?.code === "FORBIDDEN_COMPANY";

  useEffect(() => {
    if (isForbidden) setCompany(GROUP_COMPANY_ID);
  }, [isForbidden, setCompany]);

  if (query.isPending) {
    return <div className="animate-pulse rounded-xl border border-line bg-white" style={{ height }} />;
  }

  if (query.isError || query.data === undefined) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-white p-5 text-center"
        style={{ minHeight: height }}
      >
        {isForbidden && (
          <>
            <p className="text-[13px] font-semibold text-ink">No access to this company</p>
            <p className="text-[12px] text-muted">Showing the CPF Group view instead.</p>
          </>
        )}

        {error?.code === "DATA_NOT_AVAILABLE" && (
          <>
            <p className="text-[13px] font-semibold text-ink">No data for this period yet</p>
            {latestPeriodLabel && (
              <button
                onClick={showLatestPeriod}
                className="mt-1 rounded-lg bg-brand-blue px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-blue/90"
              >
                Show {latestPeriodLabel}
              </button>
            )}
          </>
        )}

        {error?.code === "UNAUTHENTICATED" && (
          <p className="text-[13px] font-semibold text-ink">Your session has expired</p>
        )}

        {!HANDLED_CODES.includes(error?.code ?? "") && (
          <>
            <p className="text-[13px] font-semibold text-ink">Something went wrong</p>
            <p className="text-[11px] text-muted">This section could not be loaded.</p>
            {error?.requestId && (
              <p className="text-[11px] text-muted">Request ID: {error.requestId}</p>
            )}
            <button
              onClick={() => query.refetch()}
              className="mt-1 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-grid"
            >
              Retry
            </button>
          </>
        )}
      </div>
    );
  }

  return <>{children(query.data)}</>;
}
