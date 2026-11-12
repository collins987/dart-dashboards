import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/lib/api/companies";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
    staleTime: 5 * 60 * 1000,
  });
}
