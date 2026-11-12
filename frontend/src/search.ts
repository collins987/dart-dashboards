/**
 * Dashboards the top-bar search can jump to. Add an entry here and it becomes
 * searchable — the Header reads this list, nothing is hard-coded in the component.
 */
export interface SearchableDashboard {
  name: string;
  description: string;
  url: string;
}

export const SEARCHABLE_DASHBOARDS: SearchableDashboard[] = [
  {
    name: "Overview",
    description: "Group income statement overview — revenue, expenses and net.",
    url: "/finance/overview",
  },
  {
    name: "Revenue Analysis",
    description: "Revenue performance by quarter, category and monthly trend.",
    url: "/finance/revenue",
  },
  {
    name: "Expense Analysis",
    description: "Expense performance by quarter, category and monthly trend.",
    url: "/finance/expenses",
  },
];
