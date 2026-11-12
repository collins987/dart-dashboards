import { apiGet } from "./client"
import type { Company } from "@/types/api"

export const getCompanies = () => apiGet<Company[]>("/companies")
