"use client";

import type { CompanyBreakdownRow } from "@/hooks/useCompanyBreakdown";
import { splitPercentages } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { COLORS } from "@/lib/constants";

interface CompanyBreakdownProps {
  rows: CompanyBreakdownRow[];
  isLoading: boolean;
  scopeLabel: string;
}

const NAME_CLASS = "w-28 shrink-0 text-xs font-medium text-ink";
const TOTAL_CLASS = "w-24 shrink-0 text-left text-xs font-bold text-ink";

function StatusBar({ label }: { label: string }) {
  return (
    <div className="flex h-8 w-3/4 items-center justify-center rounded border border-line">
      <span className="text-[10px] text-muted">{label}</span>
    </div>
  );
}

function BreakdownRow({ row }: { row: CompanyBreakdownRow }) {
  const name = row.company.shortName ?? row.company.name;

  if (row.isLoading) {
    return (
      <div className="flex items-center gap-4 py-2">
        <span className={NAME_CLASS}>{name}</span>
        <div className="h-8 w-3/4 animate-pulse rounded bg-grid" />
      </div>
    );
  }

  if (row.isNotLoaded || row.isUnavailable) {
    return (
      <div className="flex items-center gap-4 py-2">
        <span className={NAME_CLASS}>{name}</span>
        <StatusBar label={row.isNotLoaded ? "Not loaded" : "Unavailable"} />
        <span className={`${TOTAL_CLASS} text-muted`}>—</span>
      </div>
    );
  }

  const revenue = row.revenue ?? 0;
  const expense = Math.abs(row.expense ?? 0);
  const total = revenue + expense;
  const pct = splitPercentages(revenue, expense);
  const revPct = pct.revenuePct ?? 0;
  const expPct = pct.expensePct ?? 0;
  const currency = row.currency ?? "KES";

  return (
    <div className="flex items-center gap-4 py-2">
      <span className={NAME_CLASS}>{name}</span>
      <div className="w-3/4">
        <div className="mb-0.5 flex text-[9px] font-semibold">
          <span style={{ width: `${revPct}%`, color: COLORS.revenue }}>
            {revPct.toFixed(1)}%
          </span>
          <span className="text-right" style={{ width: `${expPct}%`, color: COLORS.expense }}>
            {expPct.toFixed(1)}%
          </span>
        </div>
        <div className="flex h-8 overflow-hidden rounded">
          {total > 0 && (
            <>
              <div
                className="flex items-center justify-center text-[10px] font-semibold text-white"
                style={{
                  width: `${pct.revenuePct}%`,
                  backgroundColor: COLORS.revenue,
                  minWidth: revenue > 0 ? 40 : 0,
                }}
              >
                {revenue > 0 && formatCurrency(revenue, currency)}
              </div>
              <div
                className="flex items-center justify-center text-[10px] font-semibold text-white"
                style={{
                  width: `${pct.expensePct}%`,
                  backgroundColor: COLORS.expense,
                  minWidth: expense > 0 ? 40 : 0,
                }}
              >
                {expense > 0 && formatCurrency(expense, currency)}
              </div>
            </>
          )}
        </div>
      </div>
      <span className={TOTAL_CLASS}>{formatCurrency(total, currency)}</span>
    </div>
  );
}

export function CompanyBreakdown({ rows, isLoading, scopeLabel }: CompanyBreakdownProps) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="mb-3">
        <h3 className="text-[15px] font-bold text-ink">Breakdown by Company</h3>
        <p className="text-[11px] text-muted">
          {scopeLabel} · revenue and expense share per company
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <span className="text-xs text-muted">Loading companies…</span>
        </div>
      ) : (
        <>
          <div className="flex gap-4">
            <span className="w-28 shrink-0" />
            <span className="w-3/4" />
            <span className="w-24 shrink-0 text-left text-[10px] font-semibold uppercase text-muted">
              Total
            </span>
          </div>
          <div className="divide-y divide-line">
            {rows.map((row) => (
              <BreakdownRow key={row.company.id} row={row} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
