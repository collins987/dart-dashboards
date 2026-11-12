/**
 * Request keys for the sample API. The generator (scripts/generate-data.ts) and
 * the sample router (sampleRouter.ts) both build keys with these functions, so a
 * request finds its stored response only when its normalised filters match.
 *
 * Defaults from dart-api.yaml are left out of the key. `companyIds` is omitted
 * for the group (all permitted companies), otherwise it holds one company ID.
 */

export const DEFAULT_TOP = 8;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 25;
export const DEFAULT_SORT = "-amount";

type KeyValue = string | number | boolean | null | undefined;

/** Sorted `name=value` pairs. Null, undefined and false are left out. */
export function canonicalQuery(params: Record<string, KeyValue>): string {
  return Object.keys(params)
    .filter((name) => {
      const value = params[name];
      return value !== undefined && value !== null && value !== false;
    })
    .sort()
    .map((name) => `${name}=${params[name]}`)
    .join("&");
}

interface PeriodKey {
  /** One company ID, or undefined for the group. */
  companyIds?: string;
  year: number;
  quarter?: number | null;
  month?: number | null;
}

export function summaryKey(p: PeriodKey): string {
  return canonicalQuery({
    companyIds: p.companyIds,
    year: p.year,
    quarter: p.quarter,
    month: p.month,
  });
}

export function trendKey(p: {
  companyIds?: string;
  year: number;
  granularity: "month" | "quarter";
  includePriorYear: boolean;
}): string {
  return canonicalQuery({
    companyIds: p.companyIds,
    year: p.year,
    granularity: p.granularity === "month" ? undefined : p.granularity,
    includePriorYear: p.includePriorYear,
  });
}

export function breakdownKey(p: PeriodKey & {
  type: "revenue" | "expense";
  top: number;
}): string {
  return canonicalQuery({
    companyIds: p.companyIds,
    type: p.type,
    year: p.year,
    quarter: p.quarter,
    month: p.month,
    top: p.top === DEFAULT_TOP ? undefined : p.top,
  });
}

export function accountsKey(p: PeriodKey & {
  page: number;
  pageSize: number;
  sort: string;
}): string {
  return canonicalQuery({
    companyIds: p.companyIds,
    year: p.year,
    quarter: p.quarter,
    month: p.month,
    page: p.page === DEFAULT_PAGE ? undefined : p.page,
    pageSize: p.pageSize === DEFAULT_PAGE_SIZE ? undefined : p.pageSize,
    sort: p.sort === DEFAULT_SORT ? undefined : p.sort,
  });
}
