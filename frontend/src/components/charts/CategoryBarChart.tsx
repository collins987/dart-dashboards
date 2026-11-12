import type { BreakdownItem } from "@/types/api";

interface CategoryBarChartProps {
  items: BreakdownItem[];
  colors: string[];
}

export function CategoryBarChart({ items, colors }: CategoryBarChartProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const share = Math.max(item.sharePct ?? 0, 0);
        const color = colors[i % colors.length];
        return (
          <div key={item.categoryId}>
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-ink">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {item.categoryName}
              </span>
              <span className="text-xs font-bold text-ink">
                {share.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-line">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${share}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
