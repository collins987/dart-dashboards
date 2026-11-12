import type { FilterState } from "@/types/api";
import { GROUP_COMPANY_ID } from "@/lib/constants";
import { MONTH_LABELS_SHORT } from "@/lib/months";

/** Axis labels (Jan…Dec) covered by the selected quarter or month; empty when neither is chosen. */
export function selectedMonthLabels(quarter: number | null, month: number | null): string[] {
  if (month) return [MONTH_LABELS_SHORT[month - 1]];
  if (quarter) {
    const start = (quarter - 1) * 3;
    return MONTH_LABELS_SHORT.slice(start, start + 3);
  }
  return [];
}

/**
 * Reads the filter state from a URL query. Anything missing or invalid falls
 * back to the group view and the fallback year, so a bad link still renders.
 */
export function filtersFromParams(params: URLSearchParams, fallbackYear: number): FilterState {
  const company = params.get("company");
  const year = parseInteger(params.get("year"), 2000, 2100) ?? fallbackYear;
  const quarter = parseInteger(params.get("quarter"), 1, 4);
  const month = parseInteger(params.get("month"), 1, 12);

  return {
    companyId: company && company !== GROUP_COMPANY_ID ? company : GROUP_COMPANY_ID,
    year,
    quarter: month ? null : quarter,
    month,
  };
}

/** Writes the filter state as a URL query. The group view leaves the company out. */
export function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.companyId && filters.companyId !== GROUP_COMPANY_ID) {
    params.set("company", filters.companyId);
  }
  params.set("year", String(filters.year));
  if (filters.quarter) params.set("quarter", String(filters.quarter));
  if (filters.month) params.set("month", String(filters.month));
  return params;
}

function parseInteger(raw: string | null, min: number, max: number): number | null {
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) return null;
  return value;
}
