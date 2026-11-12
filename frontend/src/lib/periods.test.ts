import { describe, it, expect } from "vitest";
import { closedMonths, isPeriodClosed, periodMonths } from "./periods";

const CURRENT = 2026;
const NOVEMBER = 10;

describe("closedMonths", () => {
  it("returns every month for a past year", () => {
    expect(closedMonths(2025, CURRENT, NOVEMBER)).toHaveLength(12);
  });

  it("stops at the present month for the current year", () => {
    expect(closedMonths(2026, CURRENT, NOVEMBER)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("returns nothing for a future year", () => {
    expect(closedMonths(2027, CURRENT, NOVEMBER)).toEqual([]);
  });
});

describe("isPeriodClosed", () => {
  it("accepts a quarter that is fully closed", () => {
    const q3 = periodMonths(2026, 3, null, CURRENT, NOVEMBER);
    expect(isPeriodClosed(q3, 2026, CURRENT, NOVEMBER)).toBe(true);
  });

  it("rejects Q4 while December has not closed", () => {
    const q4 = periodMonths(2026, 4, null, CURRENT, NOVEMBER);
    expect(isPeriodClosed(q4, 2026, CURRENT, NOVEMBER)).toBe(false);
  });

  it("rejects December before it has closed", () => {
    const dec = periodMonths(2026, null, 12, CURRENT, NOVEMBER);
    expect(isPeriodClosed(dec, 2026, CURRENT, NOVEMBER)).toBe(false);
  });

  it("accepts a month that has closed", () => {
    const nov = periodMonths(2026, null, 11, CURRENT, NOVEMBER);
    expect(isPeriodClosed(nov, 2026, CURRENT, NOVEMBER)).toBe(true);
  });

  it("rejects an empty selection", () => {
    expect(isPeriodClosed([], 2026, CURRENT, NOVEMBER)).toBe(false);
  });
});

describe("periodMonths", () => {
  it("returns the three months of a quarter", () => {
    expect(periodMonths(2026, 2, null, CURRENT, NOVEMBER)).toEqual([3, 4, 5]);
  });

  it("returns the single month selected", () => {
    expect(periodMonths(2026, null, 5, CURRENT, NOVEMBER)).toEqual([4]);
  });

  it("returns the closed months of the year when no quarter or month is chosen", () => {
    expect(periodMonths(2026, null, null, CURRENT, NOVEMBER)).toHaveLength(11);
  });
});
