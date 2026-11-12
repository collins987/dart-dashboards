import { useFilters } from "@/hooks/useFilters";
import { useCompanies } from "@/hooks/useCompanies";
import { GROUP_COMPANY_ID, GROUP_COMPANY_LABEL } from "@/lib/constants";

/** The company the page is showing: the group, or the single company selected in the filter. */
export function useScope() {
  const { filters } = useFilters();
  const { data } = useCompanies();

  const isGroup = !filters.companyId || filters.companyId === GROUP_COMPANY_ID;
  const company = data?.data.find((c) => c.id === filters.companyId);
  const name = isGroup
    ? GROUP_COMPANY_LABEL
    : company?.shortName ?? company?.name ?? GROUP_COMPANY_LABEL;

  return { isGroup, name };
}
