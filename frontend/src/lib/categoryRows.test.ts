import { describe, it, expect } from "vitest";
import { toCategoryRows } from "./categoryRows";
import type { BreakdownItem } from "@/types/api";

const item = (changePct: number | null): BreakdownItem => ({
  categoryId: "X",
  categoryName: "X",
  amount: 1_000_000,
  sharePct: 10,
  priorYearAmount: 900_000,
  changePct,
});

describe("toCategoryRows", () => {
  it("points the arrow down for an expense fall but colours it good news", () => {
    const [row] = toCategoryRows([item(-6.7)], ["#000"], "lower-is-better", "KES");
    expect(row.changeArrow).toBe("down");
    expect(row.changeTone).toBe("positive");
  });

  it("points the arrow up for an expense rise and colours it bad news", () => {
    const [row] = toCategoryRows([item(1.8)], ["#000"], "lower-is-better", "KES");
    expect(row.changeArrow).toBe("up");
    expect(row.changeTone).toBe("negative");
  });

  it("shows a dash when the share or change is missing", () => {
    const [row] = toCategoryRows(
      [{ ...item(null), sharePct: null }],
      ["#000"],
      "higher-is-better",
      "KES"
    );
    expect(row.share).toBe("—");
    expect(row.changePct).toBe("—");
    expect(row.changeTone).toBe("neutral");
  });
});
