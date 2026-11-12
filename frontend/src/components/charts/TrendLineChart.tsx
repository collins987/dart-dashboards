"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "@/lib/constants";
import { selectedMonthLabels } from "@/lib/filters";
import type { TrendPoint } from "@/types/api";

interface SharedTrendProps {
  data: TrendPoint[];
  currency: string;
  year: number;
  quarter: number | null;
  month: number | null;
}

interface OverviewTrendProps extends SharedTrendProps {
  variant: "overview";
}

interface AnalysisTrendProps extends SharedTrendProps {
  variant: "analysis";
  seriesKey: "revenue" | "expense";
  color: string;
}

export type TrendLineChartProps = OverviewTrendProps | AnalysisTrendProps;

const HIGHLIGHT_FILL = "#E4F5FB";

const yAxisLabel = (currency: string) => ({
  value: `${currency} M`,
  angle: -90,
  position: "insideLeft" as const,
  style: { fontSize: 10, fill: COLORS.muted, textAnchor: "middle" as const },
});

const tooltipFormatter = (currency: string) => (value: unknown, name: unknown) =>
  [`${currency} ${Number(value).toFixed(2)}M`, String(name)] as [string, string];

function PeriodHighlight({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <ReferenceArea
      x1={labels[0]}
      x2={labels[labels.length - 1]}
      fill={HIGHLIGHT_FILL}
      fillOpacity={0.7}
      strokeOpacity={0}
      ifOverflow="extendDomain"
    />
  );
}

export function TrendLineChart(props: TrendLineChartProps) {
  const { data, currency, year, quarter, month } = props;
  const highlighted = selectedMonthLabels(quarter, month);

  const chartData = data
    .filter((p) => p.isClosed)
    .map((p) => ({
      label: p.label,
      revenue: p.revenue != null ? p.revenue / 1_000_000 : null,
      expense: p.expense != null ? Math.abs(p.expense) / 1_000_000 : null,
      net: p.net != null ? p.net / 1_000_000 : null,
      priorRevenue: p.priorYear?.revenue != null ? p.priorYear.revenue / 1_000_000 : null,
      priorExpense:
        p.priorYear?.expense != null ? Math.abs(p.priorYear.expense) / 1_000_000 : null,
    }));

  if (props.variant === "analysis") {
    const key = props.seriesKey;
    const priorKey = key === "revenue" ? "priorRevenue" : "priorExpense";
    const gradientId = `trend-fill-${key}`;
    return (
      <div className="rounded-xl border border-line bg-white p-5">
        <div className="mb-1">
          <h3 className="text-sm font-bold text-ink">
            {key === "revenue" ? "Revenue Trend" : "Expense Trend"}
          </h3>
          <p className="text-[11px] text-muted">Monthly trend for {year}</p>
        </div>
        <div className="mb-2 flex items-center gap-4 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3" style={{ backgroundColor: props.color }} />
            This Year
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 border-t border-dashed border-muted" />
            Last Year
          </span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={props.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={props.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={COLORS.grid} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: COLORS.muted }} tickMargin={8} />
            <YAxis domain={[0, "auto"]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: COLORS.muted }} width={44} label={yAxisLabel(currency)} />
            <PeriodHighlight labels={highlighted} />
            <Tooltip formatter={tooltipFormatter(currency)} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: COLORS.line }} />
            <Area type="monotone" dataKey={key} stroke="none" fill={`url(#${gradientId})`} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey={priorKey}
              name="Last Year"
              stroke={COLORS.muted}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey={key}
              name="This Year"
              stroke={props.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#fff", stroke: props.color, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="mb-1">
        <h3 className="text-sm font-bold text-ink">Financial Performance Trend</h3>
        <p className="text-[11px] text-muted">Monthly revenue, expense and net, {year}</p>
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
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
          Net
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trend-fill-revenue-ov" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.revenue} stopOpacity={0.26} />
              <stop offset="100%" stopColor={COLORS.revenue} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="trend-fill-expense-ov" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.expense} stopOpacity={0.2} />
              <stop offset="100%" stopColor={COLORS.expense} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={COLORS.grid} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: COLORS.muted }} tickMargin={8} />
          <YAxis domain={[0, "auto"]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: COLORS.muted }} width={44} label={yAxisLabel(currency)} />
          <PeriodHighlight labels={highlighted} />
          <Tooltip formatter={tooltipFormatter(currency)} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: COLORS.line }} />
          <Area type="monotone" dataKey="revenue" stroke="none" fill="url(#trend-fill-revenue-ov)" isAnimationActive={false} />
          <Area type="monotone" dataKey="expense" stroke="none" fill="url(#trend-fill-expense-ov)" isAnimationActive={false} />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.revenue} strokeWidth={2.5} dot={{ r: 3, fill: "#fff", stroke: COLORS.revenue, strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls />
          <Line type="monotone" dataKey="expense" name="Expenses" stroke={COLORS.expense} strokeWidth={2.5} dot={{ r: 3, fill: "#fff", stroke: COLORS.expense, strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls />
          <Line type="monotone" dataKey="net" name="Net" stroke={COLORS.net} strokeWidth={2.5} dot={{ r: 3, fill: "#fff", stroke: COLORS.net, strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
