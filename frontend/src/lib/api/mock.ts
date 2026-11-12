import type {
  CompaniesResponse,
  PeriodsResponse,
  SummaryResponse,
  TrendResponse,
  BreakdownResponse,
  TrendPoint,
  BreakdownItem,
} from "@/types/api";
import type { NormalisedError } from "./client";
import {
  CURRENCY,
  DATA_AS_OF,
  CURRENT_YEAR,
  COMPANIES,
  AVAILABLE_YEARS,
  MONTH_LABELS_SHORT,
  MONTH_LABELS_FULL,
  REVENUE_CATEGORIES,
  EXPENSE_CATEGORIES,
  monthlyAmounts,
  type CategoryDef,
  type CompanyRecord,
} from "@/data";
import {
  closedMonths,
  isPeriodClosed,
  periodMonths,
  presentMonthIndex,
} from "@/lib/periods";

/**
 * Aggregates the sample dataset in src/data.ts into the dart-api.yaml response
 * envelopes. Honours the Year / Quarter / Month filters and the closed-period
 * rule: a selection that includes months not yet closed is not available, as
 * the API returns DATA_NOT_AVAILABLE for it. Used only while USE_MOCK_DATA
 * (constants.ts) is true.
 */

const NOT_AVAILABLE: NormalisedError = {
  code: "DATA_NOT_AVAILABLE",
  message: "No data available for this company and period.",
  requestId: null,
};

function clock() {
  return { currentYear: CURRENT_YEAR, presentMonth: presentMonthIndex() };
}

/** The companies a request covers: all loaded ones for group view, else the named ones. */
function selectedCompanies(companyIds?: string[]): CompanyRecord[] {
  if (!companyIds || companyIds.length === 0) {
    return COMPANIES.filter((c) => c.loaded);
  }
  return companyIds.map((id) => {
    const match = COMPANIES.find((c) => c.id === id);
    if (!match || !match.loaded) throw NOT_AVAILABLE;
    return match;
  });
}

function requireClosed(months: number[], year: number): void {
  const { currentYear, presentMonth } = clock();
  if (!isPeriodClosed(months, year, currentYear, presentMonth)) throw NOT_AVAILABLE;
}

function periodLabel(year: number, quarter: number | null, month: number | null): string {
  if (month) return `${MONTH_LABELS_FULL[month - 1]} ${year}`;
  if (quarter) return `Q${quarter} ${year}`;
  const closed = closedMonths(year, CURRENT_YEAR, presentMonthIndex());
  if (closed.length === 0) return String(year);
  return `Jan – ${MONTH_LABELS_FULL[closed[closed.length - 1]]} ${year}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function changePct(current: number, prior: number): number | null {
  if (prior === 0) return null;
  return round2(((current - prior) / Math.abs(prior)) * 100);
}

/** Whole-KES amount for one category across the given months and companies. */
function categoryTotal(
  cat: CategoryDef,
  year: number,
  months: number[],
  companies: CompanyRecord[]
): number {
  return companies.reduce((sum, company) => {
    const amounts = monthlyAmounts(cat, year, company);
    return sum + months.reduce((s, m) => s + amounts[m], 0);
  }, 0);
}

function groupTotal(
  cats: CategoryDef[],
  year: number,
  months: number[],
  companies: CompanyRecord[]
): number {
  return cats.reduce((sum, cat) => sum + categoryTotal(cat, year, months, companies), 0);
}

export const mockCompanies: CompaniesResponse = {
  data: COMPANIES.map(({ id, name, shortName }) => ({ id, name, shortName })),
};

export const mockPeriods: PeriodsResponse = {
  years: AVAILABLE_YEARS,
  latestClosedPeriod: {
    year: CURRENT_YEAR,
    month: closedMonths(CURRENT_YEAR, CURRENT_YEAR, presentMonthIndex()).length,
  },
};

export function mockSummary(
  companyIds: string[] | undefined,
  year: number,
  quarter: number | null,
  month: number | null
): SummaryResponse {
  const companies = selectedCompanies(companyIds);
  const { currentYear, presentMonth } = clock();
  const months = periodMonths(year, quarter, month, currentYear, presentMonth);
  requireClosed(months, year);

  const revenue = round2(groupTotal(REVENUE_CATEGORIES, year, months, companies));
  const expense = round2(groupTotal(EXPENSE_CATEGORIES, year, months, companies));
  const net = round2(revenue - expense);

  const priorRevenue = round2(groupTotal(REVENUE_CATEGORIES, year - 1, months, companies));
  const priorExpense = round2(groupTotal(EXPENSE_CATEGORIES, year - 1, months, companies));
  const priorNet = round2(priorRevenue - priorExpense);

  return {
    currency: CURRENCY,
    dataAsOf: DATA_AS_OF,
    appliedFilters: { companyIds: companyIds ?? [], year, quarter, month },
    data: {
      revenue,
      expense,
      net,
      periodLabel: periodLabel(year, quarter, month),
      netMarginPct: revenue > 0 ? round2((net / revenue) * 100) : null,
      comparison: {
        label: periodLabel(year - 1, quarter, month),
        revenue: priorRevenue,
        expense: priorExpense,
        net: priorNet,
        revenueChangePct: changePct(revenue, priorRevenue),
        expenseChangePct: changePct(expense, priorExpense),
        netChangePct: changePct(net, priorNet),
      },
    },
  };
}

function trendPoint(
  period: string,
  label: string,
  year: number,
  months: number[],
  includePriorYear: boolean,
  companies: CompanyRecord[]
): TrendPoint {
  const { currentYear, presentMonth } = clock();
  const isClosed = isPeriodClosed(months, year, currentYear, presentMonth);

  const point: TrendPoint = isClosed
    ? {
        period,
        label,
        isClosed: true,
        revenue: round2(groupTotal(REVENUE_CATEGORIES, year, months, companies)),
        expense: round2(groupTotal(EXPENSE_CATEGORIES, year, months, companies)),
        net: 0,
      }
    : { period, label, isClosed: false, revenue: null, expense: null, net: null };

  if (point.isClosed) {
    point.net = round2((point.revenue ?? 0) - (point.expense ?? 0));
  }

  if (includePriorYear) {
    const pr = round2(groupTotal(REVENUE_CATEGORIES, year - 1, months, companies));
    const pe = round2(groupTotal(EXPENSE_CATEGORIES, year - 1, months, companies));
    point.priorYear = { revenue: pr, expense: pe, net: round2(pr - pe) };
  }
  return point;
}

export function mockTrend(
  companyIds: string[] | undefined,
  year: number,
  granularity: "month" | "quarter",
  includePriorYear: boolean
): TrendResponse {
  const companies = selectedCompanies(companyIds);

  const data: TrendPoint[] =
    granularity === "quarter"
      ? [0, 1, 2, 3].map((qi) =>
          trendPoint(
            `${year}-Q${qi + 1}`,
            `Q${qi + 1}`,
            year,
            [qi * 3, qi * 3 + 1, qi * 3 + 2],
            includePriorYear,
            companies
          )
        )
      : MONTH_LABELS_SHORT.map((label, mi) =>
          trendPoint(
            `${year}-${String(mi + 1).padStart(2, "0")}`,
            label,
            year,
            [mi],
            includePriorYear,
            companies
          )
        );

  return {
    currency: CURRENCY,
    dataAsOf: DATA_AS_OF,
    appliedFilters: { companyIds: companyIds ?? [], year, granularity, includePriorYear },
    data,
  };
}

export function mockBreakdown(
  type: "revenue" | "expense",
  companyIds: string[] | undefined,
  year: number,
  quarter: number | null,
  month: number | null
): BreakdownResponse {
  const companies = selectedCompanies(companyIds);
  const { currentYear, presentMonth } = clock();
  const cats = type === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;
  const months = periodMonths(year, quarter, month, currentYear, presentMonth);
  requireClosed(months, year);

  const total = round2(groupTotal(cats, year, months, companies));

  const data: BreakdownItem[] = cats.map((cat) => {
    const amount = round2(categoryTotal(cat, year, months, companies));
    const priorYearAmount = round2(categoryTotal(cat, year - 1, months, companies));
    return {
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      amount,
      sharePct: total > 0 ? round2((amount / total) * 100) : null,
      priorYearAmount,
      changePct: changePct(amount, priorYearAmount),
    };
  });

  return {
    currency: CURRENCY,
    dataAsOf: DATA_AS_OF,
    appliedFilters: { companyIds: companyIds ?? [], year, quarter, month, type, top: cats.length },
    total,
    data,
  };
}
