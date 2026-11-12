# DART Audit: API Contract, Front-end Guide, Wireframes and Frontend Code

**Scope:** `dart-api.yaml` (v1.1.0, source of truth), `dart-api-frontend-guide.md`, the Revenue V1 / Expense V1 wireframes, and `app/frontend/src`.

**Status key:** [ ] open, [x] fixed. Work through the items in order within each section. Items marked **Decision** need an answer before the fix can be made.

**Overall result:** the API contract is internally consistent (the example arithmetic checks out). The front-end guide is out of date. The frontend code does not call the contract. The wireframes need data the API does not provide.

---

## 1. API contract (`dart-api.yaml`)

| # | Status | Severity | Finding | Fix |
|---|---|---|---|---|
| Y1 | [ ] | Medium | **Decision.** Zero-company users are undefined. `Forbidden` says "can view no companies at all", but there is no rule for an omitted `companyIds` when the user has none (403 or empty 200). | Define the behaviour in the YAML and the guide. |
| Y2 | [ ] | Low | `/periods` has no 403 response, and does not say how `latestClosedPeriod` behaves for a user with no companies. | Add the response or a description. |
| Y3 | [ ] | Low | `Company.shortName` is `required` and `nullable`. Consistent, but the UI needs to know null means "use `name`". | State it in the schema description. |
| Y4 | [ ] | Low | `quarter` and `month` are mutually exclusive, but the schema doesn't enforce this (no `oneOf`). Only the 400 response enforces it. | Document in the schema, or accept as is. |
| Y5 | [ ] | Info | `X-Request-ID` is documented on success and error responses. Confirmed on 401 and 500 as well. | No change needed. |

## 2. Front-end guide (`dart-api-frontend-guide.md`)

| # | Status | Severity | Finding | Fix |
|---|---|---|---|---|
| G1 | [ ] | High | Line 3 says `docs/dart-api.yaml (version 1.0.0)`. The file is `dart-api.yaml` at the project root, version 1.1.0. The line also has a stray italic marker. | Change to `dart-api.yaml` (version 1.1.0). |
| G2 | [ ] | High | Summary, trend and breakdown samples use `companyIds: ["LITES", "LPS"]`, but the guide says only LITES is loaded. | Use `["LITES"]` in the samples. |
| G3 | [ ] | High | Section 5 says `details` appears only on 400. The YAML also returns `details` on 403 `FORBIDDEN_COMPANY`. | Update the rule. |
| G4 | [ ] | High | No request rules: `quarter` and `month` cannot be combined; trend takes no quarter or month; an empty `companyIds` returns 400; `top` is 1–20 (default 8); `pageSize` is 1–100 (default 25); `sort` values. | Add a "Request rules" section. |
| G5 | [ ] | Medium | No samples for `/companies`, `/periods`, or the account drill-down (the only paginated endpoint). | Add the three samples. |
| G6 | [ ] | Medium | Auth section is incomplete. Missing: 403 for a company that does not exist (YAML says 403, not 404); 401 for a token without a reporting role. | Add both cases. |
| G7 | [ ] | Medium | `priorYear` null behaviour is not explained. With `includePriorYear=true`, amounts are null when the prior-year months are not complete. | Add the rule to the trend section. |
| G8 | [ ] | Medium | `dataAsOf` semantics are missing. It is the oldest load across the selected companies. This matters for "Last updated". | Add the rule. |
| G9 | [ ] | Low | Section 3 says "real API output", but the figures are made-up sample data. | Say "sample data". |
| G10 | [ ] | Low | The `DATA_NOT_AVAILABLE` row does not cover "a selected company has not been loaded". | Add it to the meaning column. |

## 3. Wireframes (Revenue V1 / Expense V1)

| # | Status | Severity | Gap | Options |
|---|---|---|---|---|
| W1 | [ ] | High | **Decision.** The quarter growth label "vs Q4 2025" is quarter-on-quarter. The API only compares with the same months of the prior year. | (a) Compute QoQ from trend data, including a `year=2025` trend call for Q1. (b) Relabel to "vs prior year". |
| W2 | [ ] | High | **Decision.** No endpoint lists categories, so the Category filter has no source. | (a) Add a categories endpoint and a category parameter to the backend. (b) Drop the Category filter for MVP. |
| W3 | [ ] | High | The Category filter cannot filter the charts. `summary`, `trend` and `breakdown` have no category parameter. | Same decision as W2. |
| W4 | [ ] | High | **Decision.** The company-share donut (CPF FS vs Others) needs a company split. Breakdown is by category only. | Approve one `summary` call per company, with shares computed in the frontend. |
| W5 | [ ] | Medium | **Decision.** The fresh/stale threshold is undefined. `dataAsOf` exists, but there is no age limit. | Choose the threshold (for example 24 hours). |
| W6 | [ ] | Medium | **Decision.** Expense increases currently show green, the same as revenue increases. | Choose: red for expense increases, or keep one colour for both. |
| W7 | [ ] | Low | The Finance menu needs no API, but is not built. | Build the top-bar Finance menu. |

**Covered by the API:** quarter values, monthly trend, prior-year comparison, summary totals and net, category breakdown with share and change, company list, latest complete month, last-updated time, and period labels (`periodLabel`).

## 4. Frontend code (`app/frontend/src`)

| # | Status | Severity | File | Finding | Fix |
|---|---|---|---|---|---|
| F1 | [ ] | High | `lib/api/reports.ts` | Calls `/reports`, `/reports/{id}`, `/reports/kpis`, none of which are in the contract. | Replace with the contract routes (see the route table in section 5). |
| F2 | [ ] | High | `app/(dashboard)/` | No Revenue or Expense screens and no `/financials/*` calls. No `/finance/revenue` or `/finance/expenses` routes. | Build the routes after the contract decisions are made. |
| F3 | [ ] | High | `lib/api/client.ts`, `hooks/useAuth.ts` | No `Authorization: Bearer` header. `useAuth` is a placeholder. | Send the token from the SSO session. |
| F4 | [ ] | High | `lib/api/companies.ts` | Expects an array. The API returns `{ "data": [...] }`. | Unwrap `data`. |
| F5 | [ ] | High | `types/api.ts`, `app/(dashboard)/settings/page.tsx` | `Company` declares `currency`, which companies do not have, and omits `shortName`. Settings renders `c.currency`, so it shows nothing. | Match `Company` to the schema and read currency from financial responses. |
| F6 | [ ] | High | `lib/utils.ts` | `formatPercent` multiplies by 100, but the API returns percentages already scaled (for example `2.78`). Every percentage is 100 times too large. | Format the value directly for API percentages. |
| F7 | [ ] | Medium | `lib/utils.ts` | `formatCurrency` defaults to USD. The API returns KES per response. | Pass the response `currency`. |
| F8 | [ ] | Medium | `lib/api/client.ts` | Errors are not parsed. Only the HTTP status is read, so `code`, `message`, `requestId` and `X-Request-ID` are ignored. `DATA_NOT_AVAILABLE` and `FORBIDDEN_COMPANY` can't be handled. | Parse the `Error` body and show the request ID. |
| F9 | [ ] | Medium | `types/api.ts` | Hand-written types drift from the YAML. The header says "Keep in sync with backend/app/schemas", but no `backend` folder exists in this project. | Generate types from `dart-api.yaml` (for example `openapi-typescript`). |
| F10 | [ ] | Medium | `components/layout/Header.tsx` | "Biweekly refresh" implies a refresh action that the API does not have. | Replace with "Last updated" from `dataAsOf`. |
| F11 | [ ] | Low | `components/layout/Sidebar.tsx` | No Finance entry. Nav is Dashboard, Reports, Settings. | Add Finance (Revenue, Expenses). |
| F12 | [ ] | Low | `package.json` | `react-router` is a dependency, but nothing imports it. The project is Next.js 16 App Router. | Remove it, or confirm it is needed. |
| F13 | [ ] | Info | `proxy.ts` | Passes all requests through. Once Bearer auth exists, auth gating goes here or in layouts. | Add when auth is wired. |

## 5. Routes to use (from `dart-api.yaml`)

Base URL (dev): `http://localhost:8000/api/v1`. Every request needs `Authorization: Bearer <JWT>` outside local development.

| Screen element | Route | Key parameters |
|---|---|---|
| Company filter | `GET /companies` | none |
| Year filter, default month | `GET /periods` | none |
| KPI totals | `GET /financials/summary` | `year`, `quarter` or `month`, `companyIds` |
| Quarter cards and quarterly bars | `GET /financials/trend` | `granularity=quarter`, `year`, `companyIds`, `includePriorYear=true` |
| Monthly annual trend | `GET /financials/trend` | `granularity=month`, `year`, `companyIds`, `includePriorYear=true` |
| Category donut and by-name bars | `GET /financials/breakdown` | `type=revenue` or `expense`, `year`, `quarter` or `month`, `companyIds`, `top` |
| Category drill-down (optional) | `GET /financials/categories/{categoryId}/accounts` | `year`, `quarter` or `month`, `companyIds`, `sort`, `page`, `pageSize` |

Frontend routes: `/finance/revenue` (Revenue V1) and `/finance/expenses` (Expense V1). Not yet built.

## 6. Recommended order of fixes

1. **Decisions first:** Y1, W1, W2, W4, W5, W6. Nothing in sections 3 or 4 can be finished without these.
2. **Contract and guide:** G1–G10 (quick text fixes), then Y2–Y4 once Y1 is decided.
3. **Frontend foundation:** F3 (auth), F8 (error parsing), F9 (generated types), F4 and F5 (companies), F6 and F7 (formatting).
4. **Frontend features:** F1 and F2 (routes and screens), then F10–F12 and F13.
5. **Verify:** call each route in the table against the local API and check the response matches the generated types.
