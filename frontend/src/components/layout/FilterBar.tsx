"use client";

import { ChevronDown } from "lucide-react";
import { useFilters } from "@/hooks/useFilters";
import { useCompanies } from "@/hooks/useCompanies";
import { usePeriods } from "@/hooks/usePeriods";
import { GROUP_COMPANY_ID, GROUP_COMPANY_LABEL } from "@/lib/constants";

const QUARTERS = [
  { value: "", label: "All" },
  { value: "1", label: "Q1" },
  { value: "2", label: "Q2" },
  { value: "3", label: "Q3" },
  { value: "4", label: "Q4" },
];

const MONTHS = [
  { value: "", label: "All" },
  { value: "1", label: "Jan" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "May" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Aug" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

function FilterSelect({
  label,
  value,
  options,
  onChange,
  minWidth = 100,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  minWidth?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold tracking-widest text-muted uppercase">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minWidth }}
          className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-[13px] font-medium text-ink shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}

export function FilterBar() {
  const { pending, setCompany, setYear, setQuarter, setMonth, applyFilters } =
    useFilters();
  const { data: companiesResponse } = useCompanies();
  const { data: periodsResponse } = usePeriods();

  const companies = companiesResponse?.data ?? [];
  const years = periodsResponse?.years ?? [new Date().getFullYear()];

  const companyOptions = [
    { value: GROUP_COMPANY_ID, label: GROUP_COMPANY_LABEL },
    ...companies.map((c) => ({ value: c.id, label: c.shortName ?? c.name })),
  ];

  const yearOptions = years.map((y) => ({
    value: String(y),
    label: String(y),
  }));

  return (
    <div className="flex shrink-0 items-end gap-3">
      <FilterSelect
        label="Company"
        value={pending.companyId ?? GROUP_COMPANY_ID}
        options={companyOptions}
        onChange={(v) => setCompany(v === GROUP_COMPANY_ID ? GROUP_COMPANY_ID : v)}
        minWidth={120}
      />
      <FilterSelect
        label="Year"
        value={String(pending.year)}
        options={yearOptions}
        minWidth={72}
        onChange={(v) => setYear(Number(v))}
      />
      <FilterSelect
        label="Quarter"
        value={pending.quarter ? String(pending.quarter) : ""}
        options={QUARTERS}
        minWidth={64}
        onChange={(v) => setQuarter(v ? Number(v) : null)}
      />
      <FilterSelect
        label="Month"
        value={pending.month ? String(pending.month) : ""}
        options={MONTHS}
        minWidth={64}
        onChange={(v) => setMonth(v ? Number(v) : null)}
      />
      <button
        onClick={applyFilters}
        className="h-9 rounded-lg bg-brand-blue px-5 text-[13px] font-semibold text-white shadow-sm hover:bg-brand-blue/90 active:scale-[0.98] transition-all"
      >
        Apply Filters
      </button>
    </div>
  );
}
