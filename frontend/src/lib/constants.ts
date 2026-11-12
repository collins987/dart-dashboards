export const API_BASE_URL = "/api";

export const COLORS = {
  primary: "#06ABD3",
  secondary: "#D51167",
  accent: "#E1C51A",
  blue: "#0A6FD1",
  ink: "#0F2748",
  text: "#334155",
  muted: "#64748B",
  line: "#E9EDF3",
  grid: "#F1F4F8",
  positive: "#15803D",
  negative: "#C0362C",
  revenue: "#06ABD3",
  expense: "#D51167",
  net: "#E1C51A",
  accentText: "#B8A000",
} as const;

export const REVENUE_CATEGORY_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent];
export const EXPENSE_CATEGORY_COLORS = [COLORS.secondary, COLORS.blue, COLORS.accent];

export const TINT = {
  teal: "var(--color-tint-teal)",
  pink: "var(--color-tint-pink)",
  blue: "var(--color-tint-blue)",
  yellow: "var(--color-tint-yellow)",
} as const;

export const GROUP_COMPANY_ID = "__CPF_GROUP__";
export const GROUP_COMPANY_LABEL = "CPF Group";

// Replace with auth context value once authentication is wired up.
export const CURRENT_USER = {
  name: "Signed-in user",
  email: "",
};
