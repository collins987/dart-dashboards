import { describe, it, expect } from "vitest";
import { filtersFromParams, filtersToParams, selectedMonthLabels } from "./filters";
import { GROUP_COMPANY_ID } from "./constants";

describe("filtersFromParams", () => {
  it("defaults to the group view and the fallback year", () => {
    expect(filtersFromParams(new URLSearchParams(), 2026)).toEqual({
      companyId: GROUP_COMPANY_ID,
      year: 2026,
      quarter: null,
      month: null,
    });
  });

  it("reads a company, year and quarter", () => {
    const params = new URLSearchParams("company=CPF-FS&year=2025&quarter=2");
    expect(filtersFromParams(params, 2026)).toEqual({
      companyId: "CPF-FS",
      year: 2025,
      quarter: 2,
      month: null,
    });
  });

  it("ignores an out-of-range quarter", () => {
    const params = new URLSearchParams("quarter=7");
    expect(filtersFromParams(params, 2026).quarter).toBeNull();
  });

  it("lets a month take precedence over a quarter", () => {
    const params = new URLSearchParams("quarter=2&month=5");
    const filters = filtersFromParams(params, 2026);
    expect(filters.month).toBe(5);
    expect(filters.quarter).toBeNull();
  });

  it("ignores a non-numeric year", () => {
    expect(filtersFromParams(new URLSearchParams("year=abc"), 2026).year).toBe(2026);
  });
});

describe("selectedMonthLabels", () => {
  it("returns the three months of the selected quarter", () => {
    expect(selectedMonthLabels(2, null)).toEqual(["Apr", "May", "Jun"]);
  });

  it("returns the selected month alone", () => {
    expect(selectedMonthLabels(null, 3)).toEqual(["Mar"]);
  });

  it("returns nothing when no period is selected", () => {
    expect(selectedMonthLabels(null, null)).toEqual([]);
  });
});

describe("filtersToParams", () => {
  it("leaves the company out of the group view", () => {
    const params = filtersToParams({
      companyId: GROUP_COMPANY_ID,
      year: 2026,
      quarter: null,
      month: null,
    });
    expect(params.has("company")).toBe(false);
    expect(params.get("year")).toBe("2026");
  });

  it("round-trips a company selection", () => {
    const original = { companyId: "LITES", year: 2025, quarter: 3, month: null };
    const restored = filtersFromParams(filtersToParams(original), 2026);
    expect(restored).toEqual(original);
  });
});
