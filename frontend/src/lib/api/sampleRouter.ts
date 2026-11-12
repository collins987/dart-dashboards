import {
  SAMPLE_ACCOUNTS,
  SAMPLE_BREAKDOWN,
  SAMPLE_COMPANIES,
  SAMPLE_PERIODS,
  SAMPLE_SUMMARY,
  SAMPLE_TREND,
} from "@/data";
import {
  accountsKey,
  breakdownKey,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  DEFAULT_TOP,
  summaryKey,
  trendKey,
} from "./sampleKey";

/**
 * Answers an API request from the stored sample responses in src/data.ts. It
 * applies the same checks as dart-api.yaml: 400 for invalid filters, 403 for an
 * unknown company, 404 for an unknown category or a period with no stored data.
 * Used only through the fake transport (client.ts) while USE_MOCK_DATA is true.
 */

export interface SampleReply {
  status: number;
  body: unknown;
}

type ErrorCode = "VALIDATION_ERROR" | "FORBIDDEN_COMPANY" | "NOT_FOUND" | "DATA_NOT_AVAILABLE";
type Issue = { field: string; issue: string };
type Raw = Record<string, unknown>;

const KNOWN_COMPANY_IDS = new Set(SAMPLE_COMPANIES.data.map((c) => c.id));

const MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Some filters are invalid.",
  FORBIDDEN_COMPANY: "You do not have access to one of the selected companies.",
  NOT_FOUND: "Category not found.",
  DATA_NOT_AVAILABLE: "No data for this period yet.",
};

function fail(
  requestId: string,
  status: number,
  code: ErrorCode,
  details?: Issue[],
  message: string = MESSAGES[code]
): SampleReply {
  return {
    status,
    body: {
      error: {
        code,
        message,
        requestId,
        ...(details ? { details } : {}),
      },
    },
  };
}

function ok(body: unknown): SampleReply {
  return { status: 200, body };
}

/** Reads an integer filter. Returns null when absent, or records an issue when invalid. */
function intParam(raw: Raw, name: string, min: number, max: number, issues: Issue[]): number | null {
  const value = raw[name];
  if (value === undefined || value === null || value === "") return null;
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^-?\d+$/.test(value)
        ? Number(value)
        : NaN;
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    issues.push({ field: name, issue: `${name} must be a whole number from ${min} to ${max}.` });
    return null;
  }
  return parsed;
}

/** companyIds is comma-separated. Returns the unique IDs, or null when the filter is omitted. */
function companyIdsParam(raw: Raw, issues: Issue[]): string[] | null {
  const value = raw.companyIds;
  if (value === undefined || value === null) return null;
  const text = Array.isArray(value) ? value.join(",") : String(value);
  const parts = text.split(",").map((part) => part.trim());
  if (parts.some((part) => part === "")) {
    issues.push({ field: "companyIds", issue: "Enter at least one company ID." });
    return null;
  }
  return [...new Set(parts)];
}

/**
 * The key value for a company filter: undefined for the group (all companies, or
 * every company named), otherwise the single company, or the sorted list for a
 * subset. Subsets are not stored, so they fall through to DATA_NOT_AVAILABLE.
 */
function companyKey(ids: string[] | null): string | undefined {
  if (ids === null) return undefined;
  if (ids.length === KNOWN_COMPANY_IDS.size && ids.every((id) => KNOWN_COMPANY_IDS.has(id))) {
    return undefined;
  }
  return [...ids].sort().join(",");
}

/** A company the user may not see, or one that does not exist (both 403 per the spec). */
function hasUnknownCompany(ids: string[] | null): boolean {
  return ids !== null && ids.some((id) => !KNOWN_COMPANY_IDS.has(id));
}

function requireYear(raw: Raw, issues: Issue[]): number | null {
  const year = intParam(raw, "year", 2000, 2100, issues);
  if (year === null && issues.every((i) => i.field !== "year")) {
    issues.push({ field: "year", issue: "year is required." });
  }
  return year;
}

/** quarter and month are optional and mutually exclusive. */
function periodParams(raw: Raw, issues: Issue[]) {
  const quarter = intParam(raw, "quarter", 1, 4, issues);
  const month = intParam(raw, "month", 1, 12, issues);
  if (quarter !== null && month !== null) {
    issues.push({ field: "month", issue: "quarter and month cannot be combined." });
  }
  return { quarter, month };
}

function answerSummary(raw: Raw, requestId: string): SampleReply {
  const issues: Issue[] = [];
  const ids = companyIdsParam(raw, issues);
  const year = requireYear(raw, issues);
  const { quarter, month } = periodParams(raw, issues);
  if (issues.length > 0) return fail(requestId, 400, "VALIDATION_ERROR", issues);
  if (hasUnknownCompany(ids)) return fail(requestId, 403, "FORBIDDEN_COMPANY");

  const key = summaryKey({ companyIds: companyKey(ids), year: year as number, quarter, month });
  const body = SAMPLE_SUMMARY[key];
  return body ? ok(body) : fail(requestId, 404, "DATA_NOT_AVAILABLE");
}

function answerTrend(raw: Raw, requestId: string): SampleReply {
  const issues: Issue[] = [];
  const ids = companyIdsParam(raw, issues);
  const year = requireYear(raw, issues);

  const granularity = raw.granularity ?? "month";
  if (granularity !== "month" && granularity !== "quarter") {
    issues.push({ field: "granularity", issue: "granularity must be month or quarter." });
  }

  const priorRaw = raw.includePriorYear;
  let includePriorYear = false;
  if (priorRaw === true || priorRaw === "true") includePriorYear = true;
  else if (!(priorRaw === undefined || priorRaw === null || priorRaw === false || priorRaw === "" || priorRaw === "false")) {
    issues.push({ field: "includePriorYear", issue: "includePriorYear must be true or false." });
  }

  if (issues.length > 0) return fail(requestId, 400, "VALIDATION_ERROR", issues);
  if (hasUnknownCompany(ids)) return fail(requestId, 403, "FORBIDDEN_COMPANY");

  const key = trendKey({
    companyIds: companyKey(ids),
    year: year as number,
    granularity: granularity as "month" | "quarter",
    includePriorYear,
  });
  const body = SAMPLE_TREND[key];
  return body ? ok(body) : fail(requestId, 404, "DATA_NOT_AVAILABLE");
}

function answerBreakdown(raw: Raw, requestId: string): SampleReply {
  const issues: Issue[] = [];
  const ids = companyIdsParam(raw, issues);
  const year = requireYear(raw, issues);
  const { quarter, month } = periodParams(raw, issues);
  const top = intParam(raw, "top", 1, 20, issues) ?? DEFAULT_TOP;

  if (raw.type !== "revenue" && raw.type !== "expense") {
    issues.push({ field: "type", issue: "type must be revenue or expense." });
  }

  if (issues.length > 0) return fail(requestId, 400, "VALIDATION_ERROR", issues);
  if (hasUnknownCompany(ids)) return fail(requestId, 403, "FORBIDDEN_COMPANY");

  const key = breakdownKey({
    companyIds: companyKey(ids),
    year: year as number,
    quarter,
    month,
    type: raw.type as "revenue" | "expense",
    top,
  });
  const body = SAMPLE_BREAKDOWN[key];
  return body ? ok(body) : fail(requestId, 404, "DATA_NOT_AVAILABLE");
}

function answerAccounts(categoryId: string, raw: Raw, requestId: string): SampleReply {
  const issues: Issue[] = [];
  const ids = companyIdsParam(raw, issues);
  const year = requireYear(raw, issues);
  const { quarter, month } = periodParams(raw, issues);
  const page = intParam(raw, "page", 1, Number.MAX_SAFE_INTEGER, issues) ?? DEFAULT_PAGE;
  const pageSize = intParam(raw, "pageSize", 1, 100, issues) ?? DEFAULT_PAGE_SIZE;
  const sort = raw.sort ?? DEFAULT_SORT;
  const sortOptions = ["amount", "-amount", "accountName", "-accountName"];
  if (typeof sort !== "string" || !sortOptions.includes(sort)) {
    issues.push({ field: "sort", issue: `sort must be one of ${sortOptions.join(", ")}.` });
  }

  if (issues.length > 0) return fail(requestId, 400, "VALIDATION_ERROR", issues);

  // OTHERS is a roll-up, not a category, so it is not found (per the spec).
  if (categoryId === "OTHERS" || !Object.hasOwn(SAMPLE_ACCOUNTS, categoryId)) {
    return fail(requestId, 404, "NOT_FOUND");
  }
  if (hasUnknownCompany(ids)) return fail(requestId, 403, "FORBIDDEN_COMPANY");

  const key = accountsKey({
    companyIds: companyKey(ids),
    year: year as number,
    quarter,
    month,
    page,
    pageSize,
    sort: sort as string,
  });
  const body = SAMPLE_ACCOUNTS[categoryId][key];
  return body ? ok(body) : fail(requestId, 404, "DATA_NOT_AVAILABLE");
}

/**
 * Answers one request. `path` is relative to the API base (for example
 * "/financials/summary") and `params` are the query parameters as axios sends them.
 */
export function answerSample(path: string, params: Raw, requestId: string): SampleReply {
  if (path === "/companies") return ok(SAMPLE_COMPANIES);
  if (path === "/periods") return ok(SAMPLE_PERIODS);
  if (path === "/financials/summary") return answerSummary(params, requestId);
  if (path === "/financials/trend") return answerTrend(params, requestId);
  if (path === "/financials/breakdown") return answerBreakdown(params, requestId);

  const accounts = /^\/financials\/categories\/([^/]+)\/accounts$/.exec(path);
  if (accounts) {
    return answerAccounts(decodeURIComponent(accounts[1]), params, requestId);
  }

  return fail(requestId, 404, "NOT_FOUND", undefined, "Not found.");
}
