import { useQueries } from "@tanstack/react-query";
import { getSummary } from "@/lib/api/summary";
import { isDataNotAvailable } from "@/lib/api/client";
import { useCompanies } from "./useCompanies";
import type { Company, FilterState } from "@/types/api";
import { GROUP_COMPANY_ID } from "@/lib/constants";

/** One row of the Breakdown by Company card. */
export interface CompanyBreakdownRow {
  company: Company;
  isLoading: boolean;
  /** True when the API has no data for this company yet. Renders "Not loaded". */
  isNotLoaded: boolean;
  /** True when the request failed for another reason. Renders "Unavailable". */
  isUnavailable: boolean;
  revenue: number | null;
  expense: number | null;
  total: number | null;
  currency: string | null;
}

/**
 * The API has no per-company endpoint, so the card is composed from one
 * summary call per company. They run in parallel and fail independently:
 * a company that returns 404 becomes a "Not loaded" row rather than
 * blanking the whole card.
 */
export function useCompanyBreakdown(filters: FilterState) {
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useCompanies();

  const isGroupView =
    !filters.companyId || filters.companyId === GROUP_COMPANY_ID;

  const allCompanies = companiesResponse?.data ?? [];
  const companies = isGroupView
    ? allCompanies
    : allCompanies.filter((company) => company.id === filters.companyId);

  const results = useQueries({
    queries: companies.map((company) => ({
      queryKey: ["summary", company.id, filters.year, filters.quarter, filters.month],
      queryFn: () =>
        getSummary({
          companyIds: [company.id],
          year: filters.year,
          quarter: filters.quarter,
          month: filters.month,
        }),
      retry: false,
    })),
  });

  const rows: CompanyBreakdownRow[] = companies.map((company, index) => {
    const result = results[index];

    if (result.isPending) {
      return {
        company,
        isLoading: true,
        isNotLoaded: false,
        isUnavailable: false,
        revenue: null,
        expense: null,
        total: null,
        currency: null,
      };
    }

    if (result.isError || !result.data) {
      const notLoaded = isDataNotAvailable(result.error);
      return {
        company,
        isLoading: false,
        isNotLoaded: notLoaded,
        isUnavailable: !notLoaded,
        revenue: null,
        expense: null,
        total: null,
        currency: null,
      };
    }

    const { revenue, expense } = result.data.data;
    return {
      company,
      isLoading: false,
      isNotLoaded: false,
      isUnavailable: false,
      revenue,
      expense,
      total: revenue + expense,
      currency: result.data.currency,
    };
  });

  return {
    rows,
    isLoading: isLoadingCompanies,
  };
}
