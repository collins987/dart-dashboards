"use client";

import { Fragment, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChangeDirection, ChangeTone } from "@/lib/calculations";

export interface CategoryRow {
  categoryId: string;
  /** False for roll-up rows like OTHERS, which have no account detail to drill into. */
  drillable: boolean;
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
  /** When set, drillable rows become clickable and the open one shows account detail. */
  expandedId?: string | null;
  onToggle?: (categoryId: string) => void;
  renderDetail?: (categoryId: string) => ReactNode;
}

export function CategoryTable({ rows, expandedId, onToggle, renderDetail }: CategoryTableProps) {
  const interactive = onToggle != null && renderDetail != null;

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
          {rows.map((row) => {
            const canDrill = interactive && row.drillable;
            const isOpen = canDrill && expandedId === row.categoryId;
            return (
              <Fragment key={row.categoryId}>
                <tr
                  className={cn(
                    "border-b border-line last:border-0",
                    canDrill && "cursor-pointer hover:bg-grid/60",
                    isOpen && "bg-grid/60"
                  )}
                  onClick={canDrill ? () => onToggle!(row.categoryId) : undefined}
                >
                  <td className="py-2.5">
                    <span className="flex items-center gap-2">
                      {interactive && (
                        <ChevronRight
                          size={13}
                          className={cn(
                            "shrink-0 text-muted transition-transform",
                            !row.drillable && "opacity-0",
                            isOpen && "rotate-90"
                          )}
                        />
                      )}
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: row.dotColor }}
                      />
                      <span className="font-medium text-ink">{row.name}</span>
                    </span>
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
                {isOpen && (
                  <tr>
                    <td colSpan={4} className="pb-3">
                      {renderDetail!(row.categoryId)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
