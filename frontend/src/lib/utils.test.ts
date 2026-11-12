import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent } from "./utils";

describe("formatCurrency", () => {
  it("renders millions as the KPI cards show them", () => {
    expect(formatCurrency(74_000_000, "KES")).toBe("KES 74.00M");
  });

  it("renders the breakdown total as the design shows it", () => {
    expect(formatCurrency(144_000_000, "KES")).toBe("KES 144.00M");
  });

  it("keeps the sign on a negative amount", () => {
    expect(formatCurrency(-2_500_000, "KES")).toBe("-KES 2.50M");
  });

  it("uses the currency the response carries, not a hard-coded one", () => {
    expect(formatCurrency(5_000_000, "USD")).toBe("USD 5.00M");
  });

  it("scales to billions", () => {
    expect(formatCurrency(1_050_000_000, "KES")).toBe("KES 1.05B");
  });
});

describe("formatPercent", () => {
  it("signs a rise", () => {
    expect(formatPercent(2.78)).toBe("+2.78%");
  });

  it("signs a fall", () => {
    expect(formatPercent(-6.67)).toBe("-6.67%");
  });

  it("renders a dash when the API sends null", () => {
    expect(formatPercent(null)).toBe("—");
  });

  it("does not rescale a value the API already scaled", () => {
    expect(formatPercent(5.41)).toBe("+5.41%");
  });
});
