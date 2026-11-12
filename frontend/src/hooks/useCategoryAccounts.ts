import { useQuery } from "@tanstack/react-query";
import { getCategoryAccounts } from "@/lib/api/accounts";
import type { FilterState } from "@/types/api";
import { GROUP_COMPANY_ID } from "@/lib/constants";

export type AccountSort = "amount" | "-amount" | "accountName" | "-accountName";

export const ACCOUNTS_PAGE_SIZE = 25;

/**
 * GL accounts for one breakdown category, drilled down from the category table.
 * Disabled until a category is selected, so no request fires while collapsed.
 */
export function useCategoryAccounts(
  filters: FilterState,
  categoryId: string | null,
  sort: AccountSort,
  page: number
) {
  const companyIds =
    filters.companyId && filters.companyId !== GROUP_COMPANY_ID
      ? [filters.companyId]
      : undefined;

  return useQuery({
    queryKey: ["accounts", categoryId, filters, sort, page],
    enabled: categoryId != null,
    queryFn: () =>
      getCategoryAccounts({
        categoryId: categoryId as string,
        companyIds,
        year: filters.year,
        quarter: filters.quarter,
        month: filters.month,
        sort,
        page,
        pageSize: ACCOUNTS_PAGE_SIZE,
      }),
  });
}
