"use client";

import { useFilters } from "@/hooks/useFilters";
import { useScope } from "@/hooks/useScope";
import { useSummary } from "@/hooks/useSummary";
import { useTrend } from "@/hooks/useTrend";
import { useBreakdown } from "@/hooks/useBreakdown";
import { FilterBar } from "@/components/layout/FilterBar";
import { KpiCard } from "@/components/cards/KpiCard";
import { QuarterCard } from "@/components/cards/QuarterCard";
import { QueryPanel } from "@/components/states/QueryPanel";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { CategoryTable } from "@/components/tables/CategoryTable";
import { changeTone, changeDirection, changePct } from "@/lib/calculations";
import { toCategoryRows } from "@/lib/categoryRows";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { COLORS, REVENUE_CATEGORY_COLORS } from "@/lib/constants";

export default function RevenuePage() {
  const { filters } = useFilters();
  const scope = useScope();
  const summary = useSummary(filters);
  const quarterTrend = useTrend(filters, "quarter", true);
  const monthTrend = useTrend(filters, "month", true);
  const breakdown = useBreakdown(filters, "revenue");

  const currency = summary.data?.currency ?? "KES";
  const selectedQuarter = filters.month ? Math.ceil(filters.month / 3) : filters.quarter;

  return (
    <div>
      <div className="flex items-start justify-between gap-6 border-b border-line bg-white px-8 pt-6 pb-6">
        <div>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink">
            Revenue Analysis
          </h1>
          <p className="mt-0.5 text-[13px] text-muted">Revenue performance for {scope.name}</p>
        </div>
        <FilterBar />
      </div>

      <div className="space-y-5 px-8 pb-8 pt-6">
        <div className="grid grid-cols-4 gap-4">
          <QueryPanel query={summary} height={124}>
            {(s) => (
              <KpiCard
                variant="analysis"
                label="Total Revenue"
                value={formatCurrency(s.data.revenue, currency)}
                borderColor={COLORS.revenue}
              />
            )}
          </QueryPanel>
          <QueryPanel query={summary} height={124}>
            {(s) => (
              <KpiCard
                variant="analysis"
                label="Previous Year"
                value={formatCurrency(s.data.comparison.revenue, currency)}
                borderColor={COLORS.blue}
              />
            )}
          </QueryPanel>
          <QueryPanel query={summary} height={124}>
            {(s) => (
              <KpiCard
                variant="analysis"
                label="Revenue Growth"
                value={formatPercent(s.data.comparison.revenueChangePct)}
                borderColor={COLORS.positive}
                valueTone={changeTone(s.data.comparison.revenueChangePct, "higher-is-better")}
                valueArrow={changeDirection(s.data.comparison.revenueChangePct)}
              />
            )}
          </QueryPanel>
          <QueryPanel query={summary} height={124}>
            {(s) => (
              <KpiCard
                variant="analysis"
                label="Reporting Period"
                value={s.data.periodLabel}
                borderColor={COLORS.net}
              />
            )}
          </QueryPanel>
        </div>

        <QueryPanel query={quarterTrend} height={96}>
          {(trend) => (
            <div className="grid grid-cols-4 gap-4">
              {trend.data.slice(0, 4).map((q, index) => {
                const pct = changePct(q.revenue, q.priorYear?.revenue ?? null);
                return (
                  <QuarterCard
                    key={q.label}
                    label={`${q.label} ${filters.year}`}
                    value={q.isClosed && q.revenue != null ? formatCurrency(q.revenue, trend.currency) : null}
                    changePct={pct != null ? formatPercent(pct) : undefined}
                    changeTone={pct != null ? changeTone(pct, "higher-is-better") : undefined}
                    changeArrow={pct != null ? changeDirection(pct) : undefined}
                    changeCaption={`vs ${q.label} ${filters.year - 1}`}
                    isSelected={selectedQuarter === index + 1}
                  />
                );
              })}
            </div>
          )}
        </QueryPanel>

        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <QueryPanel query={monthTrend} height={340}>
              {(trend) => (
                <TrendLineChart
                  variant="analysis"
                  data={trend.data}
                  currency={trend.currency}
                  year={filters.year}
                  quarter={filters.quarter}
                  month={filters.month}
                  seriesKey="revenue"
                  color={COLORS.revenue}
                />
              )}
            </QueryPanel>
          </div>
          <div className="col-span-2 rounded-xl border border-line bg-white p-5">
            <h3 className="text-[15px] font-bold text-ink">Revenue by Category</h3>
            <p className="mb-4 text-[11px] text-muted">
              Share of total, {summary.data?.data.periodLabel ?? "—"}
            </p>
            <QueryPanel query={breakdown} height={260}>
              {(b) => <CategoryBarChart items={b.data} colors={REVENUE_CATEGORY_COLORS} />}
            </QueryPanel>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="mb-4 text-[15px] font-bold text-ink">Revenue Categories</h3>
          <QueryPanel query={breakdown} height={200}>
            {(b) => (
              <CategoryTable
                rows={toCategoryRows(b.data, REVENUE_CATEGORY_COLORS, "higher-is-better", b.currency)}
              />
            )}
          </QueryPanel>
        </div>
      </div>
    </div>
  );
}
