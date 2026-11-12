import { useQuery } from "@tanstack/react-query";
import { getPeriods } from "@/lib/api/periods";

export function usePeriods() {
  return useQuery({
    queryKey: ["periods"],
    queryFn: getPeriods,
    staleTime: 5 * 60 * 1000,
  });
}
