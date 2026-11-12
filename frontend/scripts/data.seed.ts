/**
 * EDIT THIS FILE, then run `npm run generate:data`.
 *
 * This is the only hand-written source for the sample API. The generator reads it
 * and writes src/data.ts, which holds the exact dart-api.yaml response for every
 * request the frontend can make. Do not edit src/data.ts by hand.
 *
 * Figures are in millions of KES per month, per company and category, for the
 * base year (SEED.lastYear). Earlier years are derived from each series' yoyPct.
 * Account splits are weights; each account is its share of the category, and the
 * last account absorbs rounding so accounts always add up to their category.
 */

export const SEED = {
  currency: "KES",

  /** Years with data, ascending. */
  firstYear: 2021,
  lastYear: 2026,

  /**
   * Latest complete month. Data exists up to and including this month only, so
   * later months return 404 DATA_NOT_AVAILABLE and partial periods are cut here.
   */
  latestClosed: { year: 2026, month: 11 },

  companies: [
    {
      id: "LITES",
      name: "LASER Infrastructure and Technology Solutions",
      shortName: "LITES",
      accountPrefix: "LTS",
      dataAsOf: "2026-11-09T07:16:25Z",
    },
    {
      id: "CPF-FS",
      name: "CPF Financial Services",
      shortName: "CPF FS",
      accountPrefix: "CFS",
      dataAsOf: "2026-11-08T21:00:00Z",
    },
    {
      id: "CPF-CA",
      name: "CPF Custody & Administration",
      shortName: "CPF C&A",
      accountPrefix: "CCA",
      dataAsOf: "2026-11-10T04:30:00Z",
    },
  ],

  /**
   * Categories, shared by every company. Revenue and expense categories are
   * separate lists (type). Account weights are relative and normalised per category.
   * codeBase is the number used in GL account codes, for example LTS-6002-001.
   */
  categories: [
    {
      id: "REV-INFRA",
      name: "Infrastructure Services",
      type: "revenue" as const,
      codeBase: 4100,
      accounts: [
        { name: "Fibre Lease Income", weight: 0.45 },
        { name: "Tower Hosting Income", weight: 0.3 },
        { name: "Data Centre Colocation", weight: 0.2 },
        { name: "Maintenance Contracts", weight: 0.05 },
      ],
    },
    {
      id: "REV-TECH",
      name: "Technology Solutions",
      type: "revenue" as const,
      codeBase: 4200,
      accounts: [
        { name: "Software Licence Fees", weight: 0.4 },
        { name: "Implementation Services", weight: 0.25 },
        { name: "Managed Services Income", weight: 0.25 },
        { name: "Support & Subscriptions", weight: 0.1 },
      ],
    },
    {
      id: "REV-OTHER",
      name: "Other Income",
      type: "revenue" as const,
      codeBase: 4900,
      accounts: [
        { name: "Interest Income", weight: 0.45 },
        { name: "Rental Income", weight: 0.3 },
        { name: "Sundry Income", weight: 0.3 },
        // Negative on purpose: a net FX loss inside an income category.
        { name: "Net FX Gain / (Loss)", weight: -0.05 },
      ],
    },
    {
      id: "EXP-STAFF",
      name: "Staff Costs",
      type: "expense" as const,
      codeBase: 6002,
      accounts: [
        { name: "Staff Salaries", weight: 0.62 },
        { name: "Staff Pension ER Contribution", weight: 0.18 },
        { name: "Staff Medical Cover", weight: 0.12 },
        { name: "Staff Training & Welfare", weight: 0.08 },
      ],
    },
    {
      id: "EXP-OPEX",
      name: "Operating Expenses",
      type: "expense" as const,
      codeBase: 6100,
      accounts: [
        { name: "Power & Utilities", weight: 0.35 },
        { name: "Rent & Site Leases", weight: 0.3 },
        { name: "Repairs & Maintenance", weight: 0.2 },
        { name: "Professional Fees", weight: 0.15 },
      ],
    },
    {
      id: "EXP-OTHER",
      name: "Other Expenses",
      type: "expense" as const,
      codeBase: 6900,
      accounts: [
        { name: "Bank Charges", weight: 0.25 },
        { name: "Insurance", weight: 0.3 },
        { name: "Depreciation", weight: 0.35 },
        { name: "Sundry Expenses", weight: 0.1 },
      ],
    },
  ],

  /**
   * Base-year monthly figures per company and category, in millions of KES
   * (index 0 = January). yoyPct is this year against the prior year.
   */
  companyData: {
    LITES: {
      "REV-INFRA": { yoyPct: 5.1, monthly: [14, 15, 15, 16, 16, 17, 17, 17, 18, 18, 19, 19] },
      "REV-TECH": { yoyPct: 3.4, monthly: [9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12, 13] },
      "REV-OTHER": { yoyPct: -1.1, monthly: [3, 3, 4, 3, 4, 4, 4, 4, 4, 4, 5, 4] },
      "EXP-STAFF": { yoyPct: 1.8, monthly: [13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 17] },
      "EXP-OPEX": { yoyPct: -6.7, monthly: [8, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 13] },
      "EXP-OTHER": { yoyPct: 1.5, monthly: [4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6] },
    },
    "CPF-FS": {
      "REV-INFRA": { yoyPct: 4.2, monthly: [8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12] },
      "REV-TECH": { yoyPct: 6.0, monthly: [10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15] },
      "REV-OTHER": { yoyPct: 0.5, monthly: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5] },
      "EXP-STAFF": { yoyPct: 2.5, monthly: [10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14] },
      "EXP-OPEX": { yoyPct: -4.0, monthly: [7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10] },
      "EXP-OTHER": { yoyPct: 3.0, monthly: [3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6] },
    },
    "CPF-CA": {
      "REV-INFRA": { yoyPct: 3.0, monthly: [6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9] },
      "REV-TECH": { yoyPct: 2.0, monthly: [5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8] },
      "REV-OTHER": { yoyPct: -2.0, monthly: [2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4] },
      "EXP-STAFF": { yoyPct: 1.0, monthly: [6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9] },
      "EXP-OPEX": { yoyPct: -5.0, monthly: [4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7] },
      "EXP-OTHER": { yoyPct: 2.0, monthly: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4] },
    },
  } as Record<string, Record<string, { yoyPct: number; monthly: number[] }>>,
};
