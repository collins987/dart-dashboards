import { apiClient } from "./client";
import type { AccountListResponse } from "@/types/api";

interface AccountsParams {
  categoryId: string;
  companyIds?: string[];
  year: number;
  quarter?: number | null;
  month?: number | null;
  page?: number;
  pageSize?: number;
  sort?: "amount" | "-amount" | "accountName" | "-accountName";
}

/** Drill-down from a breakdown category to its GL accounts. Not yet used by a screen. */
export async function getCategoryAccounts(params: AccountsParams): Promise<AccountListResponse> {
  const { categoryId, ...query } = params;
  const { data } = await apiClient.get<AccountListResponse>(
    `/financials/categories/${encodeURIComponent(categoryId)}/accounts`,
    {
      params: {
        companyIds: query.companyIds?.join(",") || undefined,
        year: query.year,
        quarter: query.quarter || undefined,
        month: query.month || undefined,
        page: query.page || undefined,
        pageSize: query.pageSize || undefined,
        sort: query.sort || undefined,
      },
    }
  );
  return data;
}
