/**
 * Sample dataset for the DART dashboards — testing only.
 *
 * Three companies, each with 12 months of dummy revenue and expense data per
 * category. Each subsidiary has its own scale, category mix and growth shift,
 * so company views differ from each other and from the group total. The mock
 * API layer (lib/api/mock.ts) aggregates these months into the dart-api.yaml
 * response envelopes.
 *
 * Amounts are written in millions of KES for readability and converted to
 * whole KES by the mock layer. Prior years are derived from each category's
 * year-on-year rate (plus the company's growth shift), so "vs PY" varies.
 *
 * Edit figures here only. When the real backend is connected set
 * USE_MOCK_DATA (constants.ts) to false and this file is no longer read.
 */

export const CURRENCY = "KES";
export const DATA_AS_OF = "2026-11-09T07:16:25.478117Z";

export const CURRENT_YEAR = 2026;
export const AVAILABLE_YEARS = [2026, 2025, 2024];

export const MONTH_LABELS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const MONTH_LABELS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface CompanyRecord {
  id: string;
  name: string;
  shortName: string;
  /** Only loaded companies return data; others render "Not loaded". */
  loaded: boolean;
  /** Share of the base monthly figures this subsidiary contributes. */
  scale: number;
  /** Percentage points added to every category's growth rate for this company. */
  yoyShift: number;
  /** Multiplier per category id; categories not listed default to 1. */
  weights: Record<string, number>;
}

export const COMPANIES: CompanyRecord[] = [
  {
    id: "LITES",
    name: "LITES",
    shortName: "LITES",
    loaded: true,
    scale: 1.0,
    yoyShift: 0,
    weights: {},
  },
  {
    id: "CPF-FS",
    name: "CPF Financial Services",
    shortName: "CPF FS",
    loaded: true,
    scale: 0.65,
    yoyShift: 1.5,
    weights: {
      "REV-INFRA": 0.9,
      "REV-TECH": 1.25,
      "REV-OTHER": 1.1,
      "EXP-STAFF": 1.05,
      "EXP-OPEX": 0.9,
      "EXP-OTHER": 1.2,
    },
  },
  {
    id: "CPF-CA",
    name: "CPF Custody & Administration",
    shortName: "CPF C&A",
    loaded: true,
    scale: 0.4,
    yoyShift: -2.0,
    weights: {
      "REV-INFRA": 0.8,
      "REV-TECH": 1.0,
      "REV-OTHER": 1.6,
      "EXP-STAFF": 0.95,
      "EXP-OPEX": 1.15,
      "EXP-OTHER": 0.8,
    },
  },
];

export interface CategoryDef {
  categoryId: string;
  categoryName: string;
  /** Year-on-year growth rate (%). 2026 = prior year × (1 + growth/100). */
  yoyPct: number;
  /** 12 monthly amounts in millions of KES (index 0 = January). */
  monthly: number[];
}

export const REVENUE_CATEGORIES: CategoryDef[] = [
  {
    categoryId: "REV-INFRA",
    categoryName: "Infrastructure Services",
    yoyPct: 5.1,
    monthly: [7.2, 7.4, 7.6, 7.5, 7.8, 8.0, 8.1, 8.3, 8.2, 8.5, 8.6, 8.8],
  },
  {
    categoryId: "REV-TECH",
    categoryName: "Technology Solutions",
    yoyPct: 3.4,
    monthly: [5.3, 5.4, 5.5, 5.6, 5.5, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4],
  },
  {
    categoryId: "REV-OTHER",
    categoryName: "Others",
    yoyPct: -1.1,
    monthly: [1.2, 1.3, 1.25, 1.3, 1.35, 1.3, 1.4, 1.35, 1.45, 1.4, 1.5, 1.45],
  },
];

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  {
    categoryId: "EXP-STAFF",
    categoryName: "Staff Costs",
    yoyPct: 1.8,
    monthly: [6.3, 6.4, 6.5, 6.4, 6.6, 6.7, 6.8, 6.9, 6.8, 7.0, 7.1, 7.2],
  },
  {
    categoryId: "EXP-OPEX",
    categoryName: "Operating Expenses",
    yoyPct: -6.7,
    monthly: [5.2, 5.3, 5.4, 5.5, 5.4, 5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2],
  },
  {
    categoryId: "EXP-OTHER",
    categoryName: "Others",
    yoyPct: 1.5,
    monthly: [2.2, 2.3, 2.25, 2.3, 2.35, 2.4, 2.3, 2.45, 2.4, 2.5, 2.45, 2.6],
  },
];

const KES_PER_MILLION = 1_000_000;

/**
 * The 12 monthly amounts (whole KES) for one category in a given year, for one
 * company. Derived from the 2026 base and the category's growth plus the
 * company's growth shift.
 */
export function monthlyAmounts(
  category: CategoryDef,
  year: number,
  company: CompanyRecord
): number[] {
  const yearsBack = CURRENT_YEAR - year;
  const growth = category.yoyPct + company.yoyShift;
  const factor = Math.pow(1 + growth / 100, yearsBack);
  const weight = company.weights[category.categoryId] ?? 1;
  return category.monthly.map(
    (m) => ((m * KES_PER_MILLION) / factor) * company.scale * weight
  );
}
