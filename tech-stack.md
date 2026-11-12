# DART V2 — Tech Stack

## Frontend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 15.x | React framework with App Router |
| Language | TypeScript | 5.x | Type safety across API contracts and components |
| Styling | Tailwind CSS | 3.x | Utility-first CSS, matches Figma design tokens |
| Components | shadcn/ui | latest | Pre-built accessible components (dropdowns, tables, cards, buttons) |
| Charts | Recharts | 2.x | Bar charts, line/area charts, horizontal stacked bars |
| Data Fetching | TanStack Query | 5.x | Caching, parallel requests, loading/error state management |
| API Client | Axios | 1.x | HTTP requests to the Financial Reporting API |

## Backend (existing)

| Layer | Technology | Purpose |
|---|---|---|
| API | Financial Reporting API | REST, OpenAPI 3.0.3 (`dart-api.yaml` v1.1.0) |
| Auth | JWT Bearer token | Carries user role (GMD, EXCO, ED) and permitted companies |
| Data source | Business Central G/L Entry | Pipeline-loaded into the reporting database |

## API Endpoints

| Endpoint | Frontend Usage |
|---|---|
| `GET /companies` | Company filter dropdown |
| `GET /periods` | Year filter dropdown, default period detection |
| `GET /financials/summary` | KPI cards, quarter cards, Breakdown by Company (per-company calls) |
| `GET /financials/trend` | Bar chart (quarterly), line/area chart (monthly), trend with prior year |
| `GET /financials/breakdown` | Category bar charts and category tables (revenue and expense) |
| `GET /financials/categories/{id}/accounts` | Deferred — not in initial build |

## Key Libraries (shadcn/ui components expected)

- **Card** — KPI cards, quarter cards, chart containers, category tables
- **Select** — Company, Year, Quarter, Month dropdowns
- **Table** — Revenue/Expense category tables
- **Button** — Apply Filters
- **Badge** — Change percentage pills (+2.78%, -6.67%)
- **Separator** — Section dividers

## Design References

- **Figma file:** `jwoxew5NdjEF1uVZ3KmFeY`
- **Pages:** Overview, Revenue Analysis, Expense Analysis
- **Brand palette:** Primary #06ABD3, Secondary #D51167, Accent #E1C51A, Ink #0F2748
- **Font:** Inter (Regular, Medium, Semi Bold, Bold)
- **Layout:** 1440px frame, 120px sidebar, 1272px content area
