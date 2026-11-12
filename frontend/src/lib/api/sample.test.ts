import { describe, expect, it } from "vitest";
import {
  SAMPLE_ACCOUNTS,
  SAMPLE_BREAKDOWN,
  SAMPLE_PERIODS,
  SAMPLE_SUMMARY,
  SAMPLE_TREND,
} from "@/data";
import { answerSample, type SampleReply } from "./sampleRouter";
import { accountsKey, breakdownKey, summaryKey, trendKey } from "./sampleKey";
import type { AccountListResponse, BreakdownResponse, SummaryResponse, TrendResponse } from "@/types/api";

const GROUP = undefined;
const LITES = "LITES";

function ask(path: string, params: Record<string, unknown> = {}): SampleReply {
  return answerSample(path, params, "req_test00000000");
}

function summary(year: number, quarter?: number, month?: number, companyIds?: string): SummaryResponse {
  const reply = ask("/financials/summary", { year, quarter, month, companyIds });
  expect(reply.status).toBe(200);
  return reply.body as SummaryResponse;
}

function breakdown(type: "revenue" | "expense", year: number, companyIds?: string): BreakdownResponse {
  const reply = ask("/financials/breakdown", { type, year, companyIds });
  expect(reply.status).toBe(200);
  return reply.body as BreakdownResponse;
}

const CLOSE_TO = 2; // decimal places for money comparisons

describe("stored responses match the dart-api.yaml shape", () => {
  it("every summary has the SummaryResponse fields and finite amounts", () => {
    for (const [key, body] of Object.entries(SAMPLE_SUMMARY) as [string, SummaryResponse][]) {
      expect(body.currency, key).toBe("KES");
      expect(typeof body.dataAsOf, key).toBe("string");
      expect(Number.isFinite(body.data.revenue), key).toBe(true);
      expect(Number.isFinite(body.data.expense), key).toBe(true);
      expect(body.data.netMarginPct === null || Number.isFinite(body.data.netMarginPct), key).toBe(true);
      expect(typeof body.data.periodLabel, key).toBe("string");
      expect(typeof body.data.comparison.label, key).toBe("string");
    }
  });

  it("every trend point is closed with amounts, or open with nulls", () => {
    for (const [key, body] of Object.entries(SAMPLE_TREND) as [string, TrendResponse][]) {
      for (const point of body.data) {
        if (point.isClosed) {
          expect(point.revenue, `${key} ${point.period}`).not.toBeNull();
        } else {
          expect(point.revenue, `${key} ${point.period}`).toBeNull();
          expect(point.net, `${key} ${point.period}`).toBeNull();
        }
        const hasPrior = point.priorYear !== undefined;
        expect(hasPrior, key).toBe(body.appliedFilters.includePriorYear);
      }
    }
  });

  it("every accounts list is one page with its rows in order", () => {
    for (const [categoryId, byKey] of Object.entries(SAMPLE_ACCOUNTS)) {
      for (const [key, body] of Object.entries(byKey) as [string, AccountListResponse][]) {
        expect(body.appliedFilters.categoryId, key).toBe(categoryId);
        expect(body.pagination.totalItems, key).toBe(body.data.length);
        expect(body.pagination.totalPages, key).toBe(1);
        for (let i = 1; i < body.data.length; i++) {
          expect(body.data[i - 1].amount >= body.data[i].amount, `${key} order`).toBe(true);
        }
      }
    }
  });
});

describe("period labels follow the spec", () => {
  it("uses the full year label for a closed year and a year-to-date label for 2026", () => {
    expect(summary(2025).data.periodLabel).toBe("2025");
    expect(summary(2025).data.comparison.label).toBe("2024");
    expect(summary(2026).data.periodLabel).toBe("Jan–Nov 2026");
    expect(summary(2026).data.comparison.label).toBe("Jan–Nov 2025");
  });

  it("labels quarters and single months", () => {
    expect(summary(2026, 1).data.periodLabel).toBe("Q1 2026");
    expect(summary(2026, undefined, 9).data.periodLabel).toBe("Sep 2026");
  });

  it("cuts a partly finished quarter to its complete months", () => {
    // Q4 2026 has only October and November complete.
    expect(summary(2026, 4).data.periodLabel).toBe("Oct–Nov 2026");
    expect(summary(2026, 4).data.comparison.label).toBe("Oct–Nov 2025");
  });

  it("uses the latest closed month from /periods", () => {
    expect(SAMPLE_PERIODS.latestClosedPeriod).toEqual({ year: 2026, month: 11 });
    expect(SAMPLE_PERIODS.years).toEqual([2021, 2022, 2023, 2024, 2025, 2026]);
  });
});

describe("totals reconcile across endpoints", () => {
  it("the group equals the sum of its companies", () => {
    const group = summary(2025).data;
    const companies = ["LITES", "CPF-FS", "CPF-CA"].map((id) => summary(2025, undefined, undefined, id).data);
    const revenue = companies.reduce((s, c) => s + c.revenue, 0);
    const expense = companies.reduce((s, c) => s + c.expense, 0);
    expect(group.revenue).toBeCloseTo(revenue, CLOSE_TO);
    expect(group.expense).toBeCloseTo(expense, CLOSE_TO);
  });

  it("breakdown totals equal the summary for the same period", () => {
    const sum = summary(2026).data;
    expect(breakdown("revenue", 2026).total).toBeCloseTo(sum.revenue, CLOSE_TO);
    expect(breakdown("expense", 2026).total).toBeCloseTo(sum.expense, CLOSE_TO);
  });

  it("the closed trend months add up to the year-to-date summary", () => {
    const reply = ask("/financials/trend", { year: 2026 });
    const trend = reply.body as TrendResponse;
    const revenue = trend.data.reduce((s, p) => s + (p.revenue ?? 0), 0);
    expect(revenue).toBeCloseTo(summary(2026).data.revenue, CLOSE_TO);
  });

  it("every category's accounts add up to the category amount", () => {
    for (const [categoryId, byKey] of Object.entries(SAMPLE_ACCOUNTS)) {
      const type = categoryId.startsWith("REV-") ? "revenue" : "expense";
      for (const body of Object.values(byKey) as AccountListResponse[]) {
        const { year, quarter, month, companyIds } = body.appliedFilters;
        const scope = companyIds.length === 1 ? companyIds[0] : GROUP;
        const key = breakdownKey({
          companyIds: scope,
          year,
          quarter,
          month,
          type,
          top: 8,
        });
        const item = SAMPLE_BREAKDOWN[key]?.data.find((d) => d.categoryId === categoryId);
        expect(item, `${categoryId} ${key}`).toBeDefined();
        const sum = body.data.reduce((s, row) => s + row.amount, 0);
        expect(sum).toBeCloseTo(item!.amount, CLOSE_TO);
      }
    }
  });

  it("accounts for every category and period are stored for the group", () => {
    const expected = ["REV-INFRA", "REV-TECH", "REV-OTHER", "EXP-STAFF", "EXP-OPEX", "EXP-OTHER"];
    for (const id of expected) {
      const key = accountsKey({ year: 2025, page: 1, pageSize: 25, sort: "-amount" });
      expect(SAMPLE_ACCOUNTS[id][key], id).toBeDefined();
    }
  });
});

describe("trend, comparison and sign rules", () => {
  it("leaves unfinished months with null amounts", () => {
    const monthly = ask("/financials/trend", { year: 2026 }).body as TrendResponse;
    const december = monthly.data[11];
    expect(december.isClosed).toBe(false);
    expect(december.revenue).toBeNull();
    expect(monthly.data[10].isClosed).toBe(true);
  });

  it("returns priorYear only when asked, and as zero for a year before the data", () => {
    const plain = ask("/financials/trend", { year: 2021 }).body as TrendResponse;
    expect(plain.data[0].priorYear).toBeUndefined();
    const withPrior = ask("/financials/trend", { year: 2021, includePriorYear: true }).body as TrendResponse;
    expect(withPrior.data[0].priorYear).toEqual({ revenue: 0, expense: 0, net: 0 });
  });

  it("gives null change percentages when the prior year is zero", () => {
    const first = summary(2021).data.comparison;
    expect(first.revenue).toBe(0);
    expect(first.revenueChangePct).toBeNull();
  });

  it("stores at least one negative account (a net FX loss inside an income category)", () => {
    const rows = Object.values(SAMPLE_ACCOUNTS["REV-OTHER"]).flatMap((b) => (b as AccountListResponse).data);
    expect(rows.some((row) => row.accountName.includes("FX") && row.amount < 0)).toBe(true);
  });

  it("gives shares that add up to 100 and sorts by amount", () => {
    const body = breakdown("expense", 2025);
    const shares = body.data.reduce((s, item) => s + (item.sharePct ?? 0), 0);
    expect(shares).toBeCloseTo(100, 1);
    for (let i = 1; i < body.data.length; i++) {
      expect(body.data[i - 1].amount >= body.data[i].amount).toBe(true);
    }
  });
});

describe("requests are answered as the API would", () => {
  it("returns 403 FORBIDDEN_COMPANY for a company that does not exist or is not permitted", () => {
    const reply = ask("/financials/summary", { year: 2026, companyIds: "LPS" });
    expect(reply.status).toBe(403);
    expect((reply.body as { error: { code: string } }).error.code).toBe("FORBIDDEN_COMPANY");
  });

  it("returns 400 VALIDATION_ERROR for quarter and month together", () => {
    const reply = ask("/financials/summary", { year: 2026, quarter: 1, month: 2 });
    expect(reply.status).toBe(400);
    const error = (reply.body as { error: { code: string; details: unknown[] } }).error;
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details.length).toBeGreaterThan(0);
  });

  it("returns 400 for an empty company list and for a year that is out of range", () => {
    expect(ask("/financials/summary", { year: 2026, companyIds: "" }).status).toBe(400);
    expect(ask("/financials/summary", { year: 1999 }).status).toBe(400);
  });

  it("returns 404 DATA_NOT_AVAILABLE for December 2026 and for a year with no data", () => {
    const december = ask("/financials/summary", { year: 2026, month: 12 });
    expect(december.status).toBe(404);
    expect((december.body as { error: { code: string } }).error.code).toBe("DATA_NOT_AVAILABLE");
    expect(ask("/financials/summary", { year: 2090 }).status).toBe(404);
  });

  it("returns 404 NOT_FOUND for OTHERS and for an unknown category in the drill-down", () => {
    for (const categoryId of ["OTHERS", "NOPE"]) {
      const reply = ask(`/financials/categories/${categoryId}/accounts`, { year: 2025 });
      expect(reply.status).toBe(404);
      expect((reply.body as { error: { code: string } }).error.code).toBe("NOT_FOUND");
    }
  });

  it("returns 404 DATA_NOT_AVAILABLE for a sort or page that is not stored", () => {
    const reply = ask("/financials/categories/EXP-STAFF/accounts", { year: 2025, sort: "accountName" });
    expect(reply.status).toBe(404);
    expect((reply.body as { error: { code: string } }).error.code).toBe("DATA_NOT_AVAILABLE");
  });

  it("treats the full list of companies the same as the group", () => {
    const named = ask("/financials/summary", { year: 2025, companyIds: "CPF-CA,LITES,CPF-FS" }).body;
    expect(named).toEqual(ask("/financials/summary", { year: 2025 }).body);
  });

  it("returns the requestId on every error", () => {
    const reply = answerSample("/financials/summary", { year: 2026, companyIds: "LPS" }, "req_abc123");
    expect((reply.body as { error: { requestId: string } }).error.requestId).toBe("req_abc123");
  });

  it("serves each stored summary key exactly", () => {
    const key = summaryKey({ companyIds: LITES, year: 2024, quarter: 2 });
    expect(SAMPLE_SUMMARY[key]).toBeDefined();
    expect(trendKey({ year: 2024, granularity: "quarter", includePriorYear: true })).toBe(
      "granularity=quarter&includePriorYear=true&year=2024"
    );
  });
});

describe("the endpoint functions, through the real client", () => {
  it("returns the stored body and normalises errors", async () => {
    const { getSummary } = await import("./summary");
    const { getCategoryAccounts } = await import("./accounts");

    const body = await getSummary({ year: 2026, companyIds: ["LITES"] });
    expect(body.appliedFilters.companyIds).toEqual(["LITES"]);
    expect(body.data.periodLabel).toBe("Jan–Nov 2026");

    const rejected = await getSummary({ year: 2026, month: 12 }).then(
      () => null,
      (error: unknown) => error
    );
    expect(rejected).toMatchObject({ code: "DATA_NOT_AVAILABLE" });
    expect((rejected as { requestId: string }).requestId).toMatch(/^req_/);

    const other = await getCategoryAccounts({ categoryId: "OTHERS", year: 2025 }).then(
      () => null,
      (error: unknown) => error
    );
    expect(other).toMatchObject({ code: "NOT_FOUND" });
  });
});
