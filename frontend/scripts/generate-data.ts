/**
 * Generates src/data.ts from scripts/data.seed.ts. Run with `npm run generate:data`.
 *
 * Every response is built to the rules in dart-api.yaml:
 *  - only complete months are reported; a partial period is cut to its complete months
 *    and its labels say which months were used;
 *  - trend points that are not closed carry null amounts;
 *  - summary, breakdown and account totals agree with each other;
 *  - a category's accounts add up to the category;
 *  - a prior year before the first year of data counts as zero.
 * The stored key for each response comes from sampleKey.ts, the same code the router uses.
 */

import { writeFileSync } from "node:fs";
import { SEED } from "./data.seed.ts";
import {
  accountsKey,
  breakdownKey,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  DEFAULT_TOP,
  summaryKey,
  trendKey,
} from "../src/lib/api/sampleKey.ts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Amounts are held as whole cents while summing, so totals never drift. */
const CENTS_PER_MILLION = 100_000_000;
const LAST = SEED.latestClosed;

type Cents = number;
type Type = "revenue" | "expense";

interface Scope {
  /** Key value; undefined for the group. */
  key: string | undefined;
  /** Company IDs used for the numbers. */
  ids: string[];
  /** Company IDs echoed in appliedFilters. */
  echo: string[];
  /** Company IDs that the (sorted) accounts key uses. */
  label: string;
}

const COMPANY_IDS = SEED.companies.map((c) => c.id);
const company = (id: string) => {
  const found = SEED.companies.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown company ${id}`);
  return found;
};

const SCOPES: Scope[] = [
  { key: undefined, ids: COMPANY_IDS, echo: COMPANY_IDS, label: "group" },
  ...COMPANY_IDS.map((id) => ({ key: id, ids: [id], echo: [id], label: id })),
];

const YEARS: number[] = [];
for (let y = SEED.firstYear; y <= SEED.lastYear; y++) YEARS.push(y);

function hasData(year: number): boolean {
  return year >= SEED.firstYear && year <= SEED.lastYear;
}

/** A month (0-based index) is complete when it is on or before the latest closed month. */
function isComplete(year: number, monthIndex: number): boolean {
  return year < LAST.year || (year === LAST.year && monthIndex + 1 <= LAST.month);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function toKes(cents: Cents): number {
  return cents / 100;
}

/** Percent change on whole cents; null when the prior value is zero. */
function changePct(current: Cents, prior: Cents): number | null {
  if (prior === 0) return null;
  return round2(((current - prior) / Math.abs(prior)) * 100);
}

function categoryDef(categoryId: string) {
  const found = SEED.categories.find((c) => c.id === categoryId);
  if (!found) throw new Error(`Unknown category ${categoryId}`);
  return found;
}

// ---- Monthly figures in cents ------------------------------------------------

/**
 * A deterministic number in [0, 1) from a string seed (a small xmur3 + mulberry32).
 * Same seed always gives the same value, so regenerating the data is stable.
 */
function rand(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  const t = (h ^= h >>> 16) >>> 0;
  return t / 4294967296;
}

/** A deterministic value in [-spread, +spread] from a seed. */
function jitter(seed: string, spread: number): number {
  return (rand(seed) * 2 - 1) * spread;
}

/** This category's year-on-year growth %, wandering around its seed yoyPct by year. */
function growthPct(companyId: string, categoryId: string, year: number): number {
  const base = SEED.companyData[companyId][categoryId].yoyPct;
  return base + jitter(`growth|${companyId}|${categoryId}|${year}`, SEED.growthSpread);
}

const scaleCache = new Map<string, number>();

/** Compounded scale of a year against the base year, using each year's own growth. */
function scaleToBase(companyId: string, categoryId: string, year: number): number {
  if (year >= SEED.lastYear) return 1;
  const cacheKey = `${companyId}|${categoryId}|${year}`;
  const cached = scaleCache.get(cacheKey);
  if (cached !== undefined) return cached;
  // Growth from this year to the next pulls the next year's level back to this one.
  const step = scaleToBase(companyId, categoryId, year + 1) / (1 + growthPct(companyId, categoryId, year + 1) / 100);
  scaleCache.set(cacheKey, step);
  return step;
}

const monthlyCache = new Map<string, Cents[]>();

/** The 12 monthly amounts (cents) for one company's category in a year. */
function monthly(companyId: string, categoryId: string, year: number): Cents[] {
  const cacheKey = `${companyId}|${categoryId}|${year}`;
  const cached = monthlyCache.get(cacheKey);
  if (cached) return cached;

  const series = SEED.companyData[companyId]?.[categoryId];
  if (!series) throw new Error(`No seed data for ${companyId} ${categoryId}`);

  const yearFactor = SEED.yearFactor[year] ?? 1;
  const scale = scaleToBase(companyId, categoryId, year);

  const values = series.monthly.map((v, m) => {
    // A fresh (not compounded) seasonal nudge, different each year, so the shape moves.
    const seasonal = 1 + jitter(`month|${companyId}|${categoryId}|${year}|${m}`, SEED.monthSpread);
    return Math.round(v * CENTS_PER_MILLION * yearFactor * scale * seasonal);
  });

  monthlyCache.set(cacheKey, values);
  return values;
}

const accountCache = new Map<string, Cents[][]>();

/** Per-account monthly amounts (cents), [accountIndex][monthIndex]. Accounts add up to the category. */
function accountMonthly(companyId: string, categoryId: string, year: number): Cents[][] {
  const cacheKey = `${companyId}|${categoryId}|${year}`;
  const cached = accountCache.get(cacheKey);
  if (cached) return cached;

  const category = categoryDef(categoryId);
  const totals = monthly(companyId, categoryId, year);
  const weightSum = category.accounts.reduce((s, a) => s + a.weight, 0);
  const out: Cents[][] = category.accounts.map(() => []);

  for (let m = 0; m < 12; m++) {
    let assigned = 0;
    for (let i = 0; i < category.accounts.length - 1; i++) {
      const value = Math.round((totals[m] * category.accounts[i].weight) / weightSum);
      out[i][m] = value;
      assigned += value;
    }
    // The last account takes the remainder, so the accounts add up exactly.
    out[category.accounts.length - 1][m] = totals[m] - assigned;
  }
  accountCache.set(cacheKey, out);
  return out;
}

// ---- Aggregation over a scope and set of months --------------------------------

function categorySum(scope: Scope, categoryId: string, year: number, months: number[]): Cents {
  if (!hasData(year)) return 0;
  return scope.ids.reduce(
    (sum, id) => sum + months.reduce((s, m) => s + monthly(id, categoryId, year)[m], 0),
    0
  );
}

function typeSum(scope: Scope, type: Type, year: number, months: number[]): Cents {
  return SEED.categories
    .filter((c) => c.type === type)
    .reduce((sum, c) => sum + categorySum(scope, c.id, year, months), 0);
}

function totals(scope: Scope, year: number, months: number[]) {
  const revenue = typeSum(scope, "revenue", year, months);
  const expense = typeSum(scope, "expense", year, months);
  return { revenue, expense, net: revenue - expense };
}

/** The months a period covers, as 0-based indexes. */
function monthsFor(quarter: number | null, month: number | null): number[] {
  if (month) return [month - 1];
  if (quarter) return [0, 1, 2].map((i) => (quarter - 1) * 3 + i);
  return Array.from({ length: 12 }, (_, i) => i);
}

/**
 * periodLabel and comparison.label, from the complete months actually used.
 * "2025", "Q2 2026", "Sep 2026", or "Jan–Nov 2026" for a year still in progress.
 */
function labelFor(year: number, done: number[], quarter: number | null, month: number | null): string {
  if (month) return `${MONTHS[done[0]]} ${year}`;
  if (quarter && done.length === 3) return `Q${quarter} ${year}`;
  if (done.length === 12) return String(year);
  const first = done[0];
  const last = done[done.length - 1];
  return first === last
    ? `${MONTHS[first]} ${year}`
    : `${MONTHS[first]}–${MONTHS[last]} ${year}`;
}

function dataAsOf(scope: Scope): string {
  // The oldest load across the companies in scope.
  return scope.ids.map((id) => company(id).dataAsOf).sort()[0];
}

// ---- Response builders ---------------------------------------------------------

function buildSummary(scope: Scope, year: number, quarter: number | null, month: number | null) {
  const done = monthsFor(quarter, month).filter((m) => isComplete(year, m));
  if (done.length === 0) return null;

  const cur = totals(scope, year, done);
  const prior = totals(scope, year - 1, done);
  return {
    currency: SEED.currency,
    dataAsOf: dataAsOf(scope),
    appliedFilters: { companyIds: scope.echo, year, quarter, month },
    data: {
      revenue: toKes(cur.revenue),
      expense: toKes(cur.expense),
      net: toKes(cur.net),
      periodLabel: labelFor(year, done, quarter, month),
      netMarginPct: cur.revenue > 0 ? round2((cur.net / cur.revenue) * 100) : null,
      comparison: {
        label: labelFor(year - 1, done, quarter, month),
        revenue: toKes(prior.revenue),
        expense: toKes(prior.expense),
        net: toKes(prior.net),
        revenueChangePct: changePct(cur.revenue, prior.revenue),
        expenseChangePct: changePct(cur.expense, prior.expense),
        netChangePct: changePct(cur.net, prior.net),
      },
    },
  };
}

function buildTrend(scope: Scope, year: number, granularity: "month" | "quarter", includePriorYear: boolean) {
  const points =
    granularity === "quarter"
      ? [1, 2, 3, 4].map((q) => ({
          period: `${year}-Q${q}`,
          label: `Q${q}`,
          months: [(q - 1) * 3, (q - 1) * 3 + 1, (q - 1) * 3 + 2],
        }))
      : MONTHS.map((label, i) => ({
          period: `${year}-${String(i + 1).padStart(2, "0")}`,
          label,
          months: [i],
        }));

  const data = points.map((p) => {
    const isClosed = p.months.every((m) => isComplete(year, m));
    const current = isClosed ? totals(scope, year, p.months) : null;
    const point: Record<string, unknown> = {
      period: p.period,
      label: p.label,
      isClosed,
      revenue: current ? toKes(current.revenue) : null,
      expense: current ? toKes(current.expense) : null,
      net: current ? toKes(current.net) : null,
    };
    if (includePriorYear) {
      const prior = totals(scope, year - 1, p.months);
      point.priorYear = {
        revenue: toKes(prior.revenue),
        expense: toKes(prior.expense),
        net: toKes(prior.net),
      };
    }
    return point;
  });

  return {
    currency: SEED.currency,
    dataAsOf: dataAsOf(scope),
    appliedFilters: { companyIds: scope.echo, year, granularity, includePriorYear },
    data,
  };
}

function buildBreakdown(scope: Scope, type: Type, year: number, quarter: number | null, month: number | null) {
  const done = monthsFor(quarter, month).filter((m) => isComplete(year, m));
  if (done.length === 0) return null;

  const categories = SEED.categories.filter((c) => c.type === type);
  const current = categories.map((c) => categorySum(scope, c.id, year, done));
  const prior = categories.map((c) => categorySum(scope, c.id, year - 1, done));
  const total = current.reduce((s, v) => s + v, 0);

  const order = categories
    .map((_, i) => i)
    .sort((a, b) => current[b] - current[a] || categories[a].id.localeCompare(categories[b].id));
  const items = order.map((i) => ({
    categoryId: categories[i].id,
    categoryName: categories[i].name,
    amount: toKes(current[i]),
    sharePct: total > 0 ? round2((current[i] / total) * 100) : null,
    priorYearAmount: toKes(prior[i]),
    changePct: changePct(current[i], prior[i]),
  }));

  return {
    currency: SEED.currency,
    dataAsOf: dataAsOf(scope),
    appliedFilters: { companyIds: scope.echo, year, quarter, month, type, top: DEFAULT_TOP },
    total: toKes(total),
    data: items,
  };
}

function buildAccounts(scope: Scope, categoryId: string, year: number, quarter: number | null, month: number | null) {
  const done = monthsFor(quarter, month).filter((m) => isComplete(year, m));
  if (done.length === 0) return null;

  const category = categoryDef(categoryId);
  const rows: { accountCode: string; accountName: string; companyId: string; amount: number }[] = [];
  const cents: Cents[] = [];

  for (const companyId of scope.ids) {
    const prefix = company(companyId).accountPrefix;
    const perAccount = accountMonthly(companyId, categoryId, year);
    category.accounts.forEach((account, i) => {
      const total = done.reduce((s, m) => s + perAccount[i][m], 0);
      rows.push({
        accountCode: `${prefix}-${category.codeBase}-${String(2 * i + 1).padStart(3, "0")}`,
        accountName: account.name,
        companyId,
        amount: toKes(total),
      });
      cents.push(total);
    });
  }

  // Default sort: -amount, ties broken by company then account code.
  const order = rows
    .map((_, i) => i)
    .sort(
      (a, b) =>
        cents[b] - cents[a] ||
        rows[a].companyId.localeCompare(rows[b].companyId) ||
        rows[a].accountCode.localeCompare(rows[b].accountCode)
    );
  const data = order.map((i) => rows[i]).slice(0, DEFAULT_PAGE_SIZE);

  return {
    currency: SEED.currency,
    dataAsOf: dataAsOf(scope),
    appliedFilters: { companyIds: scope.echo, year, quarter, month, categoryId, sort: DEFAULT_SORT },
    data,
    pagination: {
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / DEFAULT_PAGE_SIZE)),
    },
  };
}

// ---- Stored response maps -------------------------------------------------------

/** Quarter and month choices for each year: the year itself, then Q1-Q4, then Jan-Dec. */
const PERIODS: { quarter: number | null; month: number | null }[] = [
  { quarter: null, month: null },
  ...[1, 2, 3, 4].map((quarter) => ({ quarter, month: null })),
  ...Array.from({ length: 12 }, (_, i) => ({ quarter: null, month: i + 1 })),
];

const summary: Record<string, unknown> = {};
const trend: Record<string, unknown> = {};
const breakdown: Record<string, unknown> = {};
const accounts: Record<string, Record<string, unknown>> = {};

let accountCount = 0;

for (const scope of SCOPES) {
  for (const year of YEARS) {
    for (const { quarter, month } of PERIODS) {
      const s = buildSummary(scope, year, quarter, month);
      if (s) summary[summaryKey({ companyIds: scope.key, year, quarter, month })] = s;

      for (const type of ["revenue", "expense"] as Type[]) {
        const b = buildBreakdown(scope, type, year, quarter, month);
        if (b) {
          breakdown[breakdownKey({ companyIds: scope.key, year, quarter, month, type, top: DEFAULT_TOP })] = b;
        }
      }

      for (const category of SEED.categories) {
        const a = buildAccounts(scope, category.id, year, quarter, month);
        if (a) {
          accounts[category.id] ??= {};
          accounts[category.id][
            accountsKey({
              companyIds: scope.key,
              year,
              quarter,
              month,
              page: DEFAULT_PAGE,
              pageSize: DEFAULT_PAGE_SIZE,
              sort: DEFAULT_SORT,
            })
          ] = a;
          accountCount++;
        }
      }
    }

    for (const granularity of ["month", "quarter"] as const) {
      for (const includePriorYear of [false, true]) {
        trend[trendKey({ companyIds: scope.key, year, granularity, includePriorYear })] = buildTrend(
          scope,
          year,
          granularity,
          includePriorYear
        );
      }
    }
  }
}

const companies = {
  data: [...SEED.companies]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, name, shortName }) => ({ id, name, shortName })),
};

const periods = {
  years: YEARS,
  latestClosedPeriod: { year: LAST.year, month: LAST.month },
};

// ---- Write src/data.ts ----------------------------------------------------------

function literal(value: unknown, indent = ""): string {
  return JSON.stringify(value, null, 2).replace(/\n/g, `\n${indent}`);
}

function recordLiteral(record: Record<string, unknown>, indent = "  "): string {
  const entries = Object.keys(record)
    .sort()
    .map((key) => `${indent}${JSON.stringify(key)}: ${literal(record[key], indent)},`);
  return entries.length === 0 ? "{}" : `{\n${entries.join("\n")}\n}`;
}

const accountsLiteral = (() => {
  const categories = Object.keys(accounts).sort();
  const body = categories
    .map((id) => `  ${JSON.stringify(id)}: ${recordLiteral(accounts[id], "    ")},`)
    .join("\n");
  return `{\n${body}\n}`;
})();

const header = `// GENERATED by scripts/generate-data.ts from scripts/data.seed.ts. Do not edit by hand:
// change the seed, then run \`npm run generate:data\`.
//
// Each record is the dart-api.yaml response for one request, keyed by the canonical
// query string from lib/api/sampleKey.ts. Keys with defaults left out
// (for example "year=2026" or "companyIds=LITES&year=2026&quarter=1").

import type {
  AccountListResponse,
  BreakdownResponse,
  CompaniesResponse,
  PeriodsResponse,
  SummaryResponse,
  TrendResponse,
} from "@/types/api";
`;

const output = [
  header,
  `export const SAMPLE_COMPANIES: CompaniesResponse = ${literal(companies)};\n`,
  `export const SAMPLE_PERIODS: PeriodsResponse = ${literal(periods)};\n`,
  `export const SAMPLE_SUMMARY: Record<string, SummaryResponse> = ${recordLiteral(summary)};\n`,
  `export const SAMPLE_TREND: Record<string, TrendResponse> = ${recordLiteral(trend)};\n`,
  `export const SAMPLE_BREAKDOWN: Record<string, BreakdownResponse> = ${recordLiteral(breakdown)};\n`,
  `/** Keyed by category ID, then by canonical query. Missing keys mean "not stored". */\n` +
    `export const SAMPLE_ACCOUNTS: Record<string, Record<string, AccountListResponse>> = ${accountsLiteral};\n`,
].join("\n");

const outPath = new URL("../src/data.ts", import.meta.url);
writeFileSync(outPath, output, "utf8");

console.log(
  `Wrote src/data.ts: ${Object.keys(summary).length} summaries, ${Object.keys(trend).length} trends, ` +
    `${Object.keys(breakdown).length} breakdowns, ${accountCount} account lists.`
);
