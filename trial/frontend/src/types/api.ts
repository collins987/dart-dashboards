// Shared API response types. Keep in sync with backend/app/schemas.

export interface Company {
  id: string;
  name: string;
  currency: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
}

export interface ReportSummary {
  id: string;
  title: string;
  period: string; // e.g. "2026-10-01/2026-10-15"
  updatedAt: string; // ISO date
  companyIds: string[];
}

export interface ReportRow {
  account: string;
  label: string;
  amount: number;
}

export interface ReportDetail extends ReportSummary {
  rows: ReportRow[];
}

export interface KpiMetric {
  label: string;
  value: number;
  change: number; // fraction, e.g. 0.042 = +4.2%
  format: "currency" | "number" | "percent";
}
