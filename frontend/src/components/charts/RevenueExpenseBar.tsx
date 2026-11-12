"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "@/lib/constants";
import { selectedMonthLabels } from "@/lib/filters";
import type { TrendPoint } from "@/types/api";

interface RevenueExpenseBarProps {
  data: TrendPoint[];
  currency: string;
  year: number;
  quarter: number | null;
  month: number | null;
  onGranularityChange?: (g: "quarter" | "month") => void;
}

const DIMMED_OPACITY = 0.35;

export function RevenueExpenseBar({
  data,
  currency,
  year,
  quarter,
  month,
  onGranularityChange,
}: RevenueExpenseBarProps) {
  const [granularity, setGranularity] = useState<"quarter" | "month">("quarter");

  const handleToggle = (g: "quarter" | "month") => {
    setGranularity(g);
    onGranularityChange?.(g);
  };

  const chartData = data
    .filter((p) => p.isClosed)
    .map((p) => ({
      label: p.label,
      revenue: (p.revenue ?? 0) / 1_000_000,
      expense: Math.abs(p.expense ?? 0) / 1_000_000,
    }));

  const selectedQuarter = month ? Math.ceil(month / 3) : quarter;
  const highlighted =
    granularity === "quarter"
      ? selectedQuarter ? [`Q${selectedQuarter}`] : []
      : selectedMonthLabels(quarter, month);

  const opacityFor = (label: string) =>
    highlighted.length === 0 || highlighted.includes(label) ? 1 : DIMMED_OPACITY;

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="mb-1 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Revenue vs Expenses</h3>
          <p className="text-[11px] text-muted">
            {granularity === "quarter"
              ? `Quarterly comparison, ${year}`
              : `Monthly comparison, ${year}`}
          </p>
        </div>
        <div className="flex rounded-md border border-line text-[10px] font-semibold">
          <button
            onClick={() => handleToggle("quarter")}
            className={`rounded-l-md px-3 py-1 transition-colors ${
              granularity === "quarter" ? "bg-brand-blue text-white" : "text-muted hover:bg-grid"
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => handleToggle("month")}
            className={`rounded-r-md px-3 py-1 transition-colors ${
              granularity === "month" ? "bg-brand-blue text-white" : "text-muted hover:bg-grid"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-4 text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-primary" />
          Revenue
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-secondary" />
          Expenses
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          barGap={6}
          barCategoryGap="34%"
          barSize={granularity === "quarter" ? 22 : 12}
          margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke={COLORS.grid} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: COLORS.muted }}
            tickMargin={10}
          />
          <YAxis
            domain={[0, "auto"]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: COLORS.muted }}
            width={44}
            label={{
              value: `${currency} M`,
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10, fill: COLORS.muted, textAnchor: "middle" },
            }}
          />
          <Tooltip
            cursor={{ fill: COLORS.grid }}
            formatter={(value, name) => [`${currency} ${Number(value).toFixed(2)}M`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: COLORS.line }}
          />
          <Bar dataKey="revenue" name="Revenue" radius={[2, 2, 0, 0]}>
            {chartData.map((point) => (
              <Cell key={point.label} fill={COLORS.revenue} fillOpacity={opacityFor(point.label)} />
            ))}
            <LabelList
              dataKey="revenue"
              position="top"
              formatter={(v: unknown) => Number(v).toFixed(1)}
              style={{ fontSize: 10, fontWeight: 600, fill: COLORS.ink }}
            />
          </Bar>
          <Bar dataKey="expense" name="Expenses" radius={[2, 2, 0, 0]}>
            {chartData.map((point) => (
              <Cell key={point.label} fill={COLORS.expense} fillOpacity={opacityFor(point.label)} />
            ))}
            <LabelList
              dataKey="expense"
              position="top"
              formatter={(v: unknown) => Number(v).toFixed(1)}
              style={{ fontSize: 10, fontWeight: 600, fill: COLORS.ink }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
