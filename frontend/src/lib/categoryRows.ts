import type { BreakdownItem } from "@/types/api";
import type { CategoryRow } from "@/components/tables/CategoryTable";
import { changeDirection, changeTone, type MetricDirection } from "@/lib/calculations";
import { formatCurrency, formatPercent } from "@/lib/utils";

/** Table rows for a category breakdown. Arrow follows the sign; colour follows favourability. */
export function toCategoryRows(
  items: BreakdownItem[],
  colors: string[],
  direction: MetricDirection,
  currency: string
): CategoryRow[] {
  return items.map((item, index) => ({
    categoryId: item.categoryId,
    // OTHERS is a roll-up with no account detail, so it cannot be drilled into.
    drillable: item.categoryId !== "OTHERS",
    name: item.categoryName,
    dotColor: colors[index % colors.length],
    amount: formatCurrency(item.amount, currency),
    share: item.sharePct != null ? `${item.sharePct.toFixed(1)}%` : "—",
    changePct: formatPercent(item.changePct),
    changeTone: changeTone(item.changePct, direction),
    changeArrow: changeDirection(item.changePct),
  }));
}
