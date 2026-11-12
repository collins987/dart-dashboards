import { describe, it, expect } from "vitest";
import { mockSummary, mockBreakdown } from "./mock";

function errorCode(fn: () => unknown): string | undefined {
  try {
    fn();
    return undefined;
  } catch (error) {
    return (error as { code?: string }).code;
  }
}

describe("mock aggregation", () => {
  it("returns the group total as the sum of its companies", () => {
    const group = mockSummary(undefined, 2025, null, null).data.revenue;
    const parts = ["LITES", "CPF-FS", "CPF-CA"].map(
      (id) => mockSummary([id], 2025, null, null).data.revenue
    );
    expect(group).toBeCloseTo(parts.reduce((a, b) => a + b, 0), 1);
  });

  it("gives each subsidiary a different revenue figure", () => {
    const lites = mockSummary(["LITES"], 2025, null, null).data.revenue;
    const fs = mockSummary(["CPF-FS"], 2025, null, null).data.revenue;
    expect(lites).not.toBe(fs);
  });

  it("gives each subsidiary its own category mix", () => {
    const lites = mockBreakdown("revenue", ["LITES"], 2025, null, null).data;
    const fs = mockBreakdown("revenue", ["CPF-FS"], 2025, null, null).data;
    const liteShare = lites[1].sharePct;
    const fsShare = fs[1].sharePct;
    expect(liteShare).not.toBe(fsShare);
  });

  it("reports an unknown company as not available", () => {
    expect(errorCode(() => mockSummary(["NOPE"], 2025, null, null))).toBe("DATA_NOT_AVAILABLE");
  });

  it("reports a future year as not available", () => {
    expect(errorCode(() => mockSummary(undefined, 2027, null, null))).toBe("DATA_NOT_AVAILABLE");
  });
});
