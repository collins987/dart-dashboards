"use client";

import { useState } from "react";
import { TrendingUp, Landmark, Percent, Wallet } from "lucide-react";
import { useFilters } from "@/hooks/useFilters";
import { useScope } from "@/hooks/useScope";
import { useSummary } from "@/hooks/useSummary";
import { useTrend } from "@/hooks/useTrend";
import { useBreakdown } from "@/hooks/useBreakdown";
import { useCompanyBreakdown } from "@/hooks/useCompanyBreakdown";
import { FilterBar } from "@/components/layout/FilterBar";
import { KpiCard } from "@/components/cards/KpiCard";
import { QueryPanel } from "@/components/states/QueryPanel";
import { RevenueExpenseBar } from "@/components/charts/RevenueExpenseBar";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { CategoryTable } from "@/components/tables/CategoryTable";
import { CompanyBreakdown } from "@/components/tables/CompanyBreakdown";
import { changeTone, changeDirection } from "@/lib/calculations";
import { toCategoryRows } from "@/lib/categoryRows";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  COLORS,
  TINT,
  REVENUE_CATEGORY_COLORS,
  EXPENSE_CATEGORY_COLORS,
  GROUP_COMPANY_LABEL,
} from "@/lib/constants";

export default function OverviewPage() {
  const { filters } = useFilters();
  const scope = useScope();
  const [barGranularity, setBarGranularity] = useState<"quarter" | "month">("quarter");

  const summary = useSummary(filters);
  const barTrend = useTrend(filters, barGranularity);
  const lineTrend = useTrend(filters, "month");
  const revBreakdown = useBreakdown(filters, "revenue");
  const expBreakdown = useBreakdown(filters, "expense");
  const breakdown = useCompanyBreakdown(filters);

  const currency = summary.data?.currency ?? "KES";
  const subtitle = scope.isGroup
    ? "Group income statement overview"
    : `${scope.name} income statement overview`;

  return (
    <div>
      <div className="flex items-start justify-between gap-6 border-b border-line bg-white px-8 pt-6 pb-6">
        <div>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight">
            <span className="text-ink">{scope.name}</span>{" "}
            <span className="text-brand-blue">Finance</span>
          </h1>
          <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
        </div>
        <FilterBar />
      </div>

      <div className="space-y-5 px-8 pb-8 pt-6">
        <div className="grid grid-cols-4 gap-4">
          <QueryPanel query={summary} height={124}>
            {(s) => (
              <KpiCard
                variant="overview"
                label="Total Revenue"
                value={formatCurrency(s.data.revenue, currency)}
                icon={TrendingUp}
                iconTint={TINT.teal}
                iconColor={COLORS.revenue}
                changePct={formatPercent(s.data.comparison.revenueChangePct)}
                changeTone={changeTone(s.data.comparison.revenueChangePct, "higher-is-better")}
                changeArrow={changeDirection(s.data.comparison.revenueChangePct)}
                changeCaption="vs prior year"
              />
            )}
          </QueryPanel>
          <QueryPanel query={summary} height={124}>
            {(s) => (
              <KpiCard
                variant="overview"
                label="Total Expenses"
                value={formatCurrency(Math.abs(s.data.expense), currency)}
                icon={Wallet}
                iconTint={TINT.pink}
                iconColor={COLORS.expense}
                changePct={formatPercent(s.data.comparison.expenseChangePct)}
                changeTone={changeTone(s.data.comparison.expenseChangePct, "lower-is-better")}
                changeArrow={changeDirection(s.data.comparison.expenseChangePct)}
                changeCaption="vs prior year"
              />
            )}
          </QueryPanel>
          <QueryPanel query={summary} height={124}>
            {(s) => (
              <KpiCard
                variant="overview"
                label="Net"
                value={formatCurrency(s.data.net, currency)}
                icon={Landmark}
                iconTint={TINT.blue}
                iconColor={COLORS.blue}
                changePct={formatPercent(s.data.comparison.netChangePct)}
                changeTone={changeTone(s.data.comparison.netChangePct, "higher-is-better")}
                changeArrow={changeDirection(s.data.comparison.netChangePct)}
                changeCaption="vs prior year"
              />
            )}
          </QueryPanel>
          <QueryPanel query={summary} height={124}>
            {(s) => (
              <KpiCard
                variant="overview"
                label="Net Margin"
                value={s.data.netMarginPct != null ? `${s.data.netMarginPct.toFixed(2)}%` : "—"}
                icon={Percent}
                iconTint={TINT.yellow}
                iconColor={COLORS.accentText}
                neutralCaption="Net / Revenue"
              />
            )}
          </QueryPanel>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <QueryPanel query={barTrend} height={380}>
            {(trend) => (
              <RevenueExpenseBar
                data={trend.data}
                currency={trend.currency}
                year={filters.year}
                quarter={filters.quarter}
                month={filters.month}
                onGranularityChange={setBarGranularity}
              />
            )}
          </QueryPanel>
          <QueryPanel query={lineTrend} height={380}>
            {(trend) => (
              <TrendLineChart
                variant="overview"
                data={trend.data}
                currency={trend.currency}
                year={filters.year}
                quarter={filters.quarter}
                month={filters.month}
              />
            )}
          </QueryPanel>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-line bg-white p-5">
            <h3 className="mb-4 text-[15px] font-bold text-ink">Revenue by Category</h3>
            <QueryPanel query={revBreakdown} height={200}>
              {(b) => (
                <CategoryTable
                  rows={toCategoryRows(b.data, REVENUE_CATEGORY_COLORS, "higher-is-better", b.currency)}
                />
              )}
            </QueryPanel>
          </div>
          <div className="rounded-xl border border-line bg-white p-5">
            <h3 className="mb-4 text-[15px] font-bold text-ink">Expenses by Category</h3>
            <QueryPanel query={expBreakdown} height={200}>
              {(b) => (
                <CategoryTable
                  rows={toCategoryRows(b.data, EXPENSE_CATEGORY_COLORS, "lower-is-better", b.currency)}
                />
              )}
            </QueryPanel>
          </div>
        </div>

        <CompanyBreakdown
          rows={breakdown.rows}
          isLoading={breakdown.isLoading}
          scopeLabel={scope.isGroup ? GROUP_COMPANY_LABEL : scope.name}
        />
      </div>
    </div>
  );
}
