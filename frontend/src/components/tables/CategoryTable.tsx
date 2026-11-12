import { cn } from "@/lib/utils";
import type { ChangeDirection, ChangeTone } from "@/lib/calculations";

export interface CategoryRow {
  name: string;
  dotColor: string;
  amount: string;
  share: string;
  changePct: string;
  changeTone: ChangeTone;
  /** Arrow follows the sign of the change; colour follows favourability. */
  changeArrow: ChangeDirection;
}

interface CategoryTableProps {
  rows: CategoryRow[];
}

export function CategoryTable({ rows }: CategoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-line">
            <th className="pb-2 text-[10px] font-semibold tracking-wider text-muted uppercase">
              Category
            </th>
            <th className="pb-2 text-right text-[10px] font-semibold tracking-wider text-muted uppercase">
              Amount
            </th>
            <th className="pb-2 text-right text-[10px] font-semibold tracking-wider text-muted uppercase">
              Share
            </th>
            <th className="pb-2 text-right text-[10px] font-semibold tracking-wider text-muted uppercase">
              vs PY
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-line last:border-0">
              <td className="flex items-center gap-2 py-2.5">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: row.dotColor }}
                />
                <span className="font-medium text-ink">{row.name}</span>
              </td>
              <td className="py-2.5 text-right font-medium text-ink">{row.amount}</td>
              <td className="py-2.5 text-right text-muted">{row.share}</td>
              <td className="py-2.5 text-right">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-medium",
                    row.changeTone === "positive" && "text-positive",
                    row.changeTone === "negative" && "text-negative",
                    row.changeTone === "neutral" && "text-muted"
                  )}
                >
                  {row.changeArrow === "up" && "▲ "}
                  {row.changeArrow === "down" && "▼ "}
                  {row.changePct}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
