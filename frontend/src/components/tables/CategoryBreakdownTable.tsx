"use client";

import { useState } from "react";
import { CategoryTable, type CategoryRow } from "./CategoryTable";
import { AccountDrilldown } from "./AccountDrilldown";
import type { FilterState } from "@/types/api";

interface CategoryBreakdownTableProps {
  rows: CategoryRow[];
  filters: FilterState;
  currency: string;
  /** When set (Category filter), show only that category's row, kept expanded. */
  focusId?: string | null;
}

/**
 * Category table with click-to-expand account drill-down. One row opens at a
 * time; roll-up rows (OTHERS) are not drillable. When `focusId` is set, the
 * table narrows to that category and keeps its accounts open.
 */
export function CategoryBreakdownTable({
  rows,
  filters,
  currency,
  focusId,
}: CategoryBreakdownTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleRows = focusId ? rows.filter((r) => r.categoryId === focusId) : rows;
  const effectiveExpanded = focusId ?? expandedId;

  return (
    <CategoryTable
      rows={visibleRows}
      expandedId={effectiveExpanded}
      onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
      renderDetail={(id) => (
        <AccountDrilldown categoryId={id} filters={filters} currency={currency} />
      )}
    />
  );
}
