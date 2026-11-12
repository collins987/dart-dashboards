/**
 * The static search index for the top-bar search. Everything a user can jump to
 * that is NOT a live backend entity is defined here, so search works in
 * production without any data fetch. Live entities (companies) are merged in by
 * the Header from the /companies response.
 *
 * Add an entry here and it becomes searchable. `keywords` holds synonyms and
 * aliases so a term like "costs" still finds the Expense dashboard.
 */

export type SearchGroup = "Dashboard" | "Metric" | "Chart" | "Category" | "Help";

export interface SearchableItem {
  id: string;
  title: string;
  description: string;
  group: SearchGroup;
  keywords: string[];
  /** Destination path, optionally with a query that pre-applies a filter. */
  url: string;
}

const OVERVIEW = "/finance/overview";
const REVENUE = "/finance/revenue";
const EXPENSES = "/finance/expenses";

export const SEARCHABLE_ITEMS: SearchableItem[] = [
  // Dashboards
  {
    id: "dash-overview",
    title: "Overview",
    description: "Group income statement overview — revenue, expenses and net.",
    group: "Dashboard",
    keywords: ["overview", "summary", "home", "dashboard", "group", "income statement", "kpis"],
    url: OVERVIEW,
  },
  {
    id: "dash-revenue",
    title: "Revenue Analysis",
    description: "Revenue performance by quarter, category and monthly trend.",
    group: "Dashboard",
    keywords: ["revenue", "income", "sales", "earnings", "turnover", "top line"],
    url: REVENUE,
  },
  {
    id: "dash-expenses",
    title: "Expense Analysis",
    description: "Expense performance by quarter, category and monthly trend.",
    group: "Dashboard",
    keywords: ["expense", "expenses", "costs", "spending", "expenditure", "outgoings"],
    url: EXPENSES,
  },

  // Metrics / KPIs
  {
    id: "metric-total-revenue",
    title: "Total Revenue",
    description: "Total revenue for the selected period.",
    group: "Metric",
    keywords: ["total revenue", "revenue", "income", "gross income"],
    url: OVERVIEW,
  },
  {
    id: "metric-total-expenses",
    title: "Total Expenses",
    description: "Total expenses for the selected period.",
    group: "Metric",
    keywords: ["total expenses", "expenses", "costs", "spend"],
    url: OVERVIEW,
  },
  {
    id: "metric-net",
    title: "Net",
    description: "Net income: revenue minus expenses.",
    group: "Metric",
    keywords: ["net", "net income", "profit", "surplus", "bottom line"],
    url: OVERVIEW,
  },
  {
    id: "metric-net-margin",
    title: "Net Margin",
    description: "Net as a percentage of revenue.",
    group: "Metric",
    keywords: ["net margin", "margin", "profitability", "profit margin"],
    url: OVERVIEW,
  },
  {
    id: "metric-revenue-growth",
    title: "Revenue Growth",
    description: "Revenue change against the prior year.",
    group: "Metric",
    keywords: ["revenue growth", "growth", "yoy", "year on year", "increase"],
    url: REVENUE,
  },
  {
    id: "metric-expense-change",
    title: "Expense Change",
    description: "Expense change against the prior year.",
    group: "Metric",
    keywords: ["expense change", "cost change", "yoy", "year on year"],
    url: EXPENSES,
  },
  {
    id: "metric-reporting-period",
    title: "Reporting Period",
    description: "The months covered by the current figures.",
    group: "Metric",
    keywords: ["reporting period", "period", "as of", "date range"],
    url: OVERVIEW,
  },

  // Charts / sections
  {
    id: "chart-rev-vs-exp",
    title: "Revenue vs Expenses",
    description: "Quarterly or monthly revenue and expense comparison.",
    group: "Chart",
    keywords: ["revenue vs expenses", "comparison", "bar chart", "quarterly"],
    url: OVERVIEW,
  },
  {
    id: "chart-performance-trend",
    title: "Financial Performance Trend",
    description: "Monthly revenue, expense and net trend.",
    group: "Chart",
    keywords: ["performance trend", "trend", "monthly", "line chart", "net trend"],
    url: OVERVIEW,
  },
  {
    id: "chart-company-breakdown",
    title: "Breakdown by Company",
    description: "Revenue and expense share per subsidiary.",
    group: "Chart",
    keywords: ["breakdown by company", "subsidiaries", "per company", "split"],
    url: OVERVIEW,
  },
  {
    id: "chart-revenue-trend",
    title: "Revenue Trend",
    description: "Monthly revenue against the same months last year.",
    group: "Chart",
    keywords: ["revenue trend", "monthly revenue", "last year"],
    url: REVENUE,
  },
  {
    id: "chart-expense-trend",
    title: "Expense Trend",
    description: "Monthly expenses against the same months last year.",
    group: "Chart",
    keywords: ["expense trend", "monthly expenses", "last year"],
    url: EXPENSES,
  },
  {
    id: "chart-revenue-by-category",
    title: "Revenue by Category",
    description: "Share of total revenue per category.",
    group: "Chart",
    keywords: ["revenue by category", "category share", "revenue mix"],
    url: REVENUE,
  },
  {
    id: "chart-expenses-by-category",
    title: "Expenses by Category",
    description: "Share of total expenses per category.",
    group: "Chart",
    keywords: ["expenses by category", "category share", "cost mix"],
    url: EXPENSES,
  },

  // Categories
  {
    id: "cat-infrastructure",
    title: "Infrastructure Services",
    description: "Revenue category.",
    group: "Category",
    keywords: ["infrastructure services", "infrastructure", "revenue category"],
    url: REVENUE,
  },
  {
    id: "cat-technology",
    title: "Technology Solutions",
    description: "Revenue category.",
    group: "Category",
    keywords: ["technology solutions", "technology", "tech", "revenue category"],
    url: REVENUE,
  },
  {
    id: "cat-staff-costs",
    title: "Staff Costs",
    description: "Expense category.",
    group: "Category",
    keywords: ["staff costs", "staff", "payroll", "salaries", "expense category"],
    url: EXPENSES,
  },
  {
    id: "cat-operating-expenses",
    title: "Operating Expenses",
    description: "Expense category.",
    group: "Category",
    keywords: ["operating expenses", "opex", "operations", "expense category"],
    url: EXPENSES,
  },

  {
    id: "cat-other-income",
    title: "Other Income",
    description: "Revenue category.",
    group: "Category",
    keywords: ["other income", "other revenue", "interest income", "rental income", "fx gain", "revenue category"],
    url: REVENUE,
  },
  {
    id: "cat-other-expenses",
    title: "Other Expenses",
    description: "Expense category.",
    group: "Category",
    keywords: ["other expenses", "other costs", "bank charges", "insurance", "depreciation", "expense category"],
    url: EXPENSES,
  },

  // Help / glossary
  {
    id: "help-group-vs-company",
    title: "Group vs company view",
    description: "Switch the Company filter to see the whole group or one subsidiary.",
    group: "Help",
    keywords: ["group", "company view", "subsidiary", "filter", "cpf group"],
    url: OVERVIEW,
  },
  {
    id: "help-vs-py",
    title: "Comparison to prior year (vs PY)",
    description: "Every change figure compares the period to the same period a year earlier.",
    group: "Help",
    keywords: ["vs py", "prior year", "comparison", "year on year", "yoy", "change"],
    url: OVERVIEW,
  },
];

/** Dashboards only, for anywhere that needs the short list. */
export const SEARCHABLE_DASHBOARDS = SEARCHABLE_ITEMS.filter((i) => i.group === "Dashboard");

/** Items whose title, description or keywords contain the query (case-insensitive). */
export function searchItems(query: string): SearchableItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return SEARCHABLE_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(needle) ||
      item.description.toLowerCase().includes(needle) ||
      item.keywords.some((k) => k.includes(needle))
  );
}
