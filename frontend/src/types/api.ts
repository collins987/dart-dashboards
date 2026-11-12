// Types matching dart-api.yaml v1.1.0 schemas

export interface Company {
  id: string;
  name: string;
  shortName: string | null;
}

export interface CompaniesResponse {
  data: Company[];
}

export interface PeriodsResponse {
  years: number[];
  latestClosedPeriod: { year: number; month: number } | null;
}

export interface Comparison {
  label: string;
  revenue: number;
  expense: number;
  net: number;
  revenueChangePct: number | null;
  expenseChangePct: number | null;
  netChangePct: number | null;
}

export interface SummaryData {
  revenue: number;
  expense: number;
  net: number;
  periodLabel: string;
  netMarginPct: number | null;
  comparison: Comparison;
}

export interface PeriodFilters {
  companyIds: string[];
  year: number;
  quarter: number | null;
  month: number | null;
}

export interface SummaryResponse {
  currency: string;
  dataAsOf: string;
  appliedFilters: PeriodFilters;
  data: SummaryData;
}

export interface TrendPoint {
  period: string;
  label: string;
  isClosed: boolean;
  revenue: number | null;
  expense: number | null;
  net: number | null;
  priorYear?: {
    revenue: number | null;
    expense: number | null;
    net: number | null;
  };
}

export interface TrendFilters {
  companyIds: string[];
  year: number;
  granularity: "month" | "quarter";
  includePriorYear: boolean;
}

export interface TrendResponse {
  currency: string;
  dataAsOf: string;
  appliedFilters: TrendFilters;
  data: TrendPoint[];
}

export interface BreakdownItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  sharePct: number | null;
  priorYearAmount: number;
  changePct: number | null;
}

export interface BreakdownFilters {
  companyIds: string[];
  year: number;
  quarter: number | null;
  month: number | null;
  type: "revenue" | "expense";
  top: number;
}

export interface BreakdownResponse {
  currency: string;
  dataAsOf: string;
  appliedFilters: BreakdownFilters;
  total: number;
  data: BreakdownItem[];
}

export interface AccountItem {
  accountCode: string;
  accountName: string;
  companyId: string;
  amount: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AccountListResponse {
  currency: string;
  dataAsOf: string;
  appliedFilters: {
    companyIds: string[];
    year: number;
    quarter: number | null;
    month: number | null;
    categoryId: string;
    sort: string;
  };
  data: AccountItem[];
  pagination: Pagination;
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN_COMPANY"
  | "NOT_FOUND"
  | "DATA_NOT_AVAILABLE"
  | "INTERNAL_ERROR";

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: { field: string; issue: string }[];
    requestId: string;
  };
}

export interface FilterState {
  companyId: string | null;
  year: number;
  quarter: number | null;
  month: number | null;
}
