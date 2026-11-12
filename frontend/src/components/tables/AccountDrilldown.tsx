"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCategoryAccounts, type AccountSort } from "@/hooks/useCategoryAccounts";
import { isNormalisedError } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils";
import type { FilterState } from "@/types/api";

interface AccountDrilldownProps {
  categoryId: string;
  filters: FilterState;
  currency: string;
}

/** Account-level detail for one category: sortable, paginated, self-contained. */
export function AccountDrilldown({ categoryId, filters, currency }: AccountDrilldownProps) {
  const [sort, setSort] = useState<AccountSort>("-amount");
  const [page, setPage] = useState(1);

  const query = useCategoryAccounts(filters, categoryId, sort, page);

  function toggleSort(column: "amount" | "accountName") {
    setPage(1);
    setSort((prev) => {
      const asc = column === "amount" ? "amount" : "accountName";
      const desc = column === "amount" ? "-amount" : "-accountName";
      return prev === desc ? asc : desc;
    });
  }

  if (query.isPending) {
    return <div className="h-24 animate-pulse rounded-lg bg-grid" />;
  }

  if (query.isError || query.data === undefined) {
    const err = isNormalisedError(query.error) ? query.error : null;
    return (
      <p className="py-3 text-center text-[12px] text-muted">
        {err?.code === "NOT_FOUND"
          ? "No account detail for this category."
          : "Could not load account detail."}
      </p>
    );
  }

  const { data: accounts, pagination } = query.data;

  if (accounts.length === 0) {
    return <p className="py-3 text-center text-[12px] text-muted">No accounts in this period.</p>;
  }

  return (
    <div className="rounded-lg bg-grid/50 p-3">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-line">
            <th className="pb-2">
              <button
                onClick={() => toggleSort("accountName")}
                className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider text-muted uppercase hover:text-ink"
              >
                Account <ArrowUpDown size={11} />
              </button>
            </th>
            <th className="pb-2 text-right">
              <button
                onClick={() => toggleSort("amount")}
                className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider text-muted uppercase hover:text-ink"
              >
                Amount <ArrowUpDown size={11} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={`${a.companyId}-${a.accountCode}`} className="border-b border-line last:border-0">
              <td className="py-2">
                <span className="font-medium text-ink">{a.accountName}</span>
                <span className="ml-2 text-[10px] text-muted">{a.accountCode}</span>
              </td>
              <td className="py-2 text-right font-medium text-ink">
                {formatCurrency(a.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination.totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
          <span>
            {pagination.totalItems} accounts · page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
              className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-white disabled:opacity-40"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
