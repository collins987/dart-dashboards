"use client";

import { useContext } from "react";
import { FilterContext } from "@/providers/FilterProvider";

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilters must be used within FilterProvider");
  return context;
}
