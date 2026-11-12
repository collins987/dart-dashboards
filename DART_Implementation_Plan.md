# DART V2 — Frontend Implementation Plan

**Prepared for:** the developer building the DART dashboards (you), structured so a supervisor can review the approach without reading code.

**Version:** 1.0
**Date:** 2026-11-11
**Status:** Ready to build

---

## 1. Introduction

### 1.1 Purpose

This document is the build roadmap for turning the approved Figma dashboards into working software. It is the Phase 4 (Development) artifact of the SDLC, taking the Phase 3 Design outputs — the Figma file and `dart-api.yaml` — as fixed inputs.

### 1.2 Scope

**In scope:** Three dashboard screens (Overview, Revenue Analysis, Expense Analysis) built to match the Figma designs exactly, consuming five of the six documented API endpoints.

**Out of scope (deliberately, per decisions already taken):**
- Category drill-down to GL accounts (`/financials/categories/{id}/accounts`) — deferred
- Reporting-period label on the Overview header — confirmed to stay off
- Data-freshness pill and manual refresh — removed from the design by earlier direction
- Export, scheduling, report builder, fine-grained permissions

### 1.3 The governing constraint

**Build the Figma designs exactly. Do not redesign.**

Every layout decision, colour, label, figure format and spacing choice in Figma is the specification. Where this document gives a measurement, it is a transcription of the design, not a proposal. If a Figma detail appears wrong during the build, raise it — do not silently correct it in code.

### 1.4 Source documents

| Document | Role |
|---|---|
| `dart-api.yaml` v1.1.0 | API contract — source of truth, read-only |
| `dart-api-frontend-guide.md` | Integration rules — source of truth, read-only |
| Figma `jwoxew5NdjEF1uVZ3KmFeY` | Visual specification |
| `Project Structure` | Monorepo layout |
| `tech-stack.md` | Approved technology choices |
| `docs/Clean Coding Practices.pdf` | Code standards (§2 below) |
| `docs/Core Design Principles.pdf` | Architecture standards (§3 below) |
| `docs/SDLC Document.pdf` | Process framework |
| `docs/Software Design Document (SDD) Template.pdf` | Document structure for the formal SDD |

### 1.5 Definitions

| Term | Meaning |
|---|---|
| Group view | Company filter set to "CPF Group" — API called with no `companyIds` |
| Company view | Company filter set to one subsidiary — API called with that `companyId` |
| Closed period | A month or quarter where `isClosed: true` and amounts are non-null |
| Not loaded | A company whose data returns 404 `DATA_NOT_AVAILABLE` |
| Period label | The `periodLabel` string from the API, e.g. "Jan–May 2026" |

---

## 2. Code standards applied to this build

Drawn from your Clean Coding Practices guide. These are the rules a reviewer will check against.

### 2.1 Naming

- Components are nouns in PascalCase describing what they render: `KpiCard`, `CompanyBreakdown`, not `Card2` or `DataDisplay`.
- Hooks are `use` + the thing they return: `useSummary`, `useBreakdown`.
- No magic numbers or colour literals in components. Every colour comes from the token file; every layout constant that appears twice becomes a named constant.
- Booleans read as assertions: `isClosed`, `hasPriorYear`, not `flag` or `check`.

### 2.2 Functions and components

- A component renders one thing. If a component both fetches and lays out and formats, split it.
- Formatting logic lives in `lib/utils.ts` as pure functions, never inline in JSX.
- Early returns for loading, error and empty states. No deeply nested ternaries in JSX.
- Props objects over long parameter lists. A chart taking six positional arguments is a design smell.

### 2.3 Comments

- Default to none. Well-named components and functions carry the meaning.
- Write a comment only where the *why* is non-obvious: a Figma-specific measurement that looks arbitrary, an API quirk the code works around, a deliberate deviation.
- No commented-out code. Git holds the history.

### 2.4 Formatting

- Prettier and ESLint run on save, on pre-commit, and in CI. A build fails on lint errors.
- Double quotes for strings, consistent with the existing scaffold.
- One statement per line; lines kept readable.

### 2.5 Commits

Conventional style, stating what changed and why:

```
feat: add KpiCard with change badge and null-safe percentage
fix: unwrap data envelope from companies response
refactor: extract bar-segment width calculation into pure function
```

### 2.6 Testing

Per your guide: small, fast, independent, repeatable, one assertion of behaviour per test.

---

## 3. Architecture

### 3.1 Layered architecture

Your Core Design Principles document (§11) prescribes four layers with dependencies pointing one way, toward a stable core. Mapped onto this frontend:

| Layer | Contents | Depends on |
|---|---|---|
| **Entry / Interface** | `app/**` route files, page components | Orchestration |
| **Orchestration** | `hooks/**` — compose API calls, own query keys and cache policy | Core + Infrastructure |
| **Core logic** | `lib/utils.ts`, `lib/calculations.ts` — pure functions: formatting, percentage splits, bar widths, null handling | Nothing |
| **Infrastructure** | `lib/api/**` — Axios client, endpoint wrappers, error normalisation | `types/api.ts` only |

**The test of this layering:** can every function in the Core layer be tested without a network, a browser, or a React render? If not, UI or I/O has leaked into the core.

Presentational components (`components/**`) sit alongside the Entry layer. They receive data as props and render it. They do not call hooks that fetch.

### 3.2 Dependency isolation

Per Core Design Principles §7, third-party specifics stay at the edges:

- **Axios** is confined to `lib/api/client.ts`. No component imports Axios. If the HTTP client changes, one file changes.
- **Recharts** is confined to `components/charts/**`. Pages pass plain arrays of plain objects; they do not know Recharts exists.
- **TanStack Query** appears only in `hooks/**` and the provider. Pages call `useSummary(filters)` and receive `{ data, isLoading, error }` — they do not know the caching library.

This is the Adapter pattern applied where it removes real pain: a library swap or a breaking upgrade touches one directory.

### 3.3 Separation of concerns

Three concerns stay apart:

1. **Fetching** — hooks. Know about endpoints, parameters, caching.
2. **Calculating** — pure functions. Know about arithmetic and formatting. No React, no network.
3. **Rendering** — components. Know about layout and Figma. Receive finished values.

A component that calls `.toFixed(2)` inline has mixed concern 2 into concern 3. Move it.

### 3.4 Data flow

```
FilterProvider (pending filters)
      │  user clicks Apply Filters
      ▼
FilterProvider (applied filters)  ──► hooks (useSummary, useTrend, useBreakdown)
                                            │
                                            ▼
                                     lib/api/* ──► HTTP ──► API
                                            │
                                            ▼
                                     raw API response
                                            │
                                            ▼
                                   lib/calculations.ts (pure)
                                            │
                                            ▼
                                   presentational components
```

**Why Apply Filters is a manual trigger:** every filter change otherwise refires four to eight requests. The button batches them. This matches the design, which shows an explicit button.

### 3.5 Module breakdown

| Module | One-sentence responsibility |
|---|---|
| `lib/api` | Turn endpoint calls into typed responses or normalised errors |
| `lib/calculations` | Derive display values from API data without side effects |
| `lib/utils` | Format numbers, currency and percentages for display |
| `hooks` | Bind filter state to API calls and expose query results |
| `providers` | Hold filter state and the query client |
| `components/layout` | Render the application shell |
| `components/cards` | Render a single metric |
| `components/charts` | Render a dataset as a chart |
| `components/tables` | Render a dataset as rows |
| `app` | Compose components into the three screens |

Each passes the Parnas test: described in one sentence without saying how it works.

---

## 4. Data contracts

### 4.1 Endpoint usage

| Endpoint | Called by | Parameters used | Cache |
|---|---|---|---|
| `GET /companies` | `useCompanies` | none | 5 min |
| `GET /periods` | `usePeriods` | none | 5 min |
| `GET /financials/summary` | `useSummary`, `useCompanyBreakdown` | `companyIds`, `year`, `quarter`\|`month` | 1 min |
| `GET /financials/trend` | `useTrend` | `companyIds`, `year`, `granularity`, `includePriorYear` | 1 min |
| `GET /financials/breakdown` | `useBreakdown` | `companyIds`, `year`, `quarter`\|`month`, `type` | 1 min |

### 4.2 Filter state model

```ts
interface FilterState {
  companyId: string | null;   // null or GROUP_COMPANY_ID means group view
  year: number;
  quarter: number | null;
  month: number | null;
}
```

Two copies live in `FilterProvider`: `pending` (what the dropdowns show) and `filters` (what the hooks use). Apply Filters copies pending into filters. This is the only place that distinction exists.

### 4.3 Quarter and month mutual exclusivity

The API returns 400 if both are sent. The provider enforces this structurally — setting one nulls the other:

```ts
const setQuarter = (q) => setPending(prev => ({ ...prev, quarter: q, month: null }));
const setMonth   = (m) => setPending(prev => ({ ...prev, month: m, quarter: null }));
```

The invalid state cannot be represented, so no validation is needed downstream. This is already implemented in the scaffold.

### 4.4 Group vs company view

`GROUP_COMPANY_ID` is a frontend sentinel. The `/companies` endpoint returns only real subsidiaries; "CPF Group" is an option the UI adds.

```ts
const companyIds =
  filters.companyId && filters.companyId !== GROUP_COMPANY_ID
    ? [filters.companyId]
    : undefined;   // undefined → omit the parameter → API aggregates all
```

This conversion happens in one place per hook and nowhere else.

### 4.5 Nullable fields — the complete list

Handling these is not optional; the API will send nulls.

| Field | Null when | Display |
|---|---|---|
| `netMarginPct` | revenue is zero | `—` |
| `revenueChangePct` / `expenseChangePct` / `netChangePct` | prior value is zero | `—`, no arrow, neutral colour |
| `sharePct` | breakdown total is zero | `—` |
| `changePct` (breakdown item) | prior-year amount is zero | `—` |
| `TrendPoint.revenue` / `.expense` / `.net` | `isClosed: false` | no bar, line break |
| `priorYear` object | `includePriorYear` not requested | comparison series absent |
| `latestClosedPeriod` | no complete month yet | fall back to current year |

`formatPercent` already returns `—` for null. Every percentage must go through it.

### 4.6 Negative amounts

The API spec warns a category amount can be negative (an FX loss inside an income category). Bars must not render negative width, and the amount must display with its sign. `formatCurrency` already handles the sign; chart components must clamp width at zero.

### 4.7 Breakdown by Company — the N+1 pattern

No endpoint returns per-company totals. The card composes them:

```
1. useCompanies()                          → company list
2. For each company, in parallel:
   useSummary({ companyIds: [id], ...filters })
3. 200 → render split bar
   404 DATA_NOT_AVAILABLE → render "Not loaded"
   other error → surface to the card's error state
```

Implement with TanStack Query's `useQueries` so all requests fire together and each company's failure is isolated. A 404 on one company must not blank the whole card.

---

## 5. Build sequence

Ten phases. Each has a deliverable you can look at and a check you can run. Phases 1 and 2 are independent and can run in parallel; everything after depends on both.

### Phase 0 — Toolchain

**Deliverable:** `npm run dev` serves a page; lint and typecheck pass.

1. `npm install` in `frontend/`
2. `npx shadcn@latest init`, then add `button card select table badge separator`
3. Configure Prettier; wire ESLint and Prettier into a pre-commit hook
4. Confirm the API proxy in `next.config.ts` reaches the backend at `localhost:8000`

**Check:** dev server runs, `npm run lint` clean, `npx tsc --noEmit` clean.

---

### Phase 1 — Design tokens and primitives

**Deliverable:** every colour and type style from Figma available as a token.

Tokens already in `tailwind.config.ts`:

| Token | Hex | Used for |
|---|---|---|
| `brand.primary` | `#06ABD3` | Revenue series, revenue segments, Revenue tab |
| `brand.secondary` | `#D51167` | Expense series, expense segments, Expenses tab |
| `brand.accent` | `#E1C51A` | Net series, "Others" category |
| `brand.blue` | `#0A6FD1` | Header bar, Overview tab, Apply Filters |
| `ink` | `#0F2748` | Headings, bold values |
| `text` | `#334155` | Body text |
| `muted` | `#64748B` | Labels, subtitles, axis text |
| `line` | `#E9EDF3` | Card borders, table rules |
| `grid` | `#F1F4F8` | Page background, chart gridlines |
| `positive` / `positive.bg` | `#15803D` / `#E7F6EC` | Favourable change badge |
| `negative` / `negative.bg` | `#C0362C` / `#FBE9E7` | Unfavourable change badge |

Type scale from the design: page title 28px Bold; card value 26px Bold; section title 15px Bold; table header 10px Semi Bold uppercase with letter-spacing; body 13px Regular; label 11px Medium.

Font: Inter, loaded via `next/font/google` (already in `app/layout.tsx`).

**Check:** a scratch page rendering every token swatch matches the Figma colour board side by side.

---

### Phase 2 — Data layer

**Deliverable:** every endpoint callable and typed; pure calculations unit-tested.

2.1 `types/api.ts` — already written, mirrors the YAML schemas. Verify each required field matches.

2.2 `lib/api/*.ts` — already scaffolded. Complete the error normalisation in `client.ts` so every rejection carries `{ code, message, requestId }`.

2.3 `lib/calculations.ts` — **new file**, pure functions, no React:

```ts
splitPercentages(revenue, expense)     // → { revenuePct, expensePct }
segmentWidths(revenue, expense, barWidth)
scaledBarWidth(total, minTotal, maxTotal, minWidth, maxWidth)
closedPoints(trendData)                // filters isClosed
quarterChangePct(current, priorYear)
```

2.4 `hooks/*.ts` — already scaffolded. Add `useCompanyBreakdown` using `useQueries`.

**Check:** unit tests for every function in `calculations.ts`. These are pure — input in, value out, no mocks. Per your testing guide: fast, independent, one behaviour each.

---

### Phase 3 — Application shell

**Deliverable:** header, sidebar and filter bar matching Figma on all three routes.

**3.1 Header** (`components/layout/Header.tsx`)

Full-width bar, 56px tall, background `brand.blue`. Contents left to right:
- Logo mark (rounded square, white/teal bar-chart icon) + "Dart" wordmark in white Bold
- Vertical divider, then "Financial Reporting ⌄" in white
- Right: search field (rounded, translucent white, placeholder "Search reports, companies…"), avatar circle "JD" with white ring

**3.2 Sidebar** (`components/layout/Sidebar.tsx`)

120px wide, white, full height. Contents:
- "Finance ⌄" with a document icon, a rule beneath it
- Three items at y 116 / 158 / 200: Overview, Revenue, Expenses, each with its icon
- Active item: tinted pill background plus a 4px indicator bar at the far-left edge of the viewport
- Active colours: Overview `brand.blue`, Revenue `brand.primary`, Expenses `brand.secondary`

Active state derives from the current route via `usePathname()`.

**3.3 Filter bar** (`components/layout/FilterBar.tsx`)

Right-aligned row in the page header band. Four dropdowns, each a stacked label + value:
- COMPANY → "CPF Group" plus companies from `useCompanies`
- YEAR → years from `usePeriods`
- QUARTER → All, Q1–Q4
- MONTH → All, Jan–Dec

Then the Apply Filters button: `brand.blue` background, white text, rounded.

Quarter and Month reset each other through the provider (§4.3).

**Check:** screenshot each route and overlay the Figma frame. Header height, sidebar width, indicator bar position and tab colours must match.

---

### Phase 4 — Shared display components

**Deliverable:** cards and tables rendering from props, verified against Figma.

**4.1 `KpiCard`** — Overview variant

White card, rounded, `line` border. Icon tile (44px rounded square, tinted background, coloured glyph) on the left. To its right: label in `muted` 11px uppercase, value in `ink` 26px Bold, then a change badge.

Badge: `positive.bg` with ▲ or `negative.bg` with ▼, followed by "vs prior year" in `muted`. The Net Margin card shows a neutral `grid` pill reading "Net / Revenue" instead.

Props: `label`, `value`, `icon`, `iconTint`, `changePct`, `changeCaption`, `neutralCaption`.

**Semantics note:** for expenses, a *decrease* is favourable. The badge colour follows favourability, not sign. Pass the intent explicitly rather than inferring it from the number.

**4.2 `KpiCard`** — Analysis variant

Same card with a 4px coloured left border instead of an icon tile, label above a large value, no badge. Border colours: Revenue page `brand.primary` / `brand.blue` / `positive` / `brand.accent`; Expense page `brand.secondary` / `brand.blue` / `positive` / `brand.accent`.

**4.3 `QuarterCard`**

Label "Q1 2026" in `ink` 11px Semi Bold, value 22px Bold, then a change badge with "vs Q1 2025" in `muted`. When the quarter is not closed, render `—` for the value and omit the badge.

**4.4 `CategoryTable`**

Header row: CATEGORY, AMOUNT, SHARE, VS PY — 10px Semi Bold uppercase `muted`, letter-spaced, with a `line` rule beneath. Rows: colour dot + name left; amount, share and change right-aligned; `line` rule between rows.

Change cell: ▲ in `positive` or ▼ in `negative`, value from `formatPercent`.

Dot colours follow the category's series colour in the design — not a rotating palette.

**Check:** render each with the exact Figma figures (Infrastructure Services KES 38.50M / 52.0% / +5.1%, and so on) and compare against the frame.

---

### Phase 5 — Charts

**Deliverable:** three chart components matching Figma, handling nulls.

**5.1 `RevenueExpenseBar`** — Overview, left chart

Grouped vertical bars, two per quarter. Revenue `brand.primary`, Expenses `brand.secondary`. **Sharp corners, thin bars** — this was an explicit design correction; do not round them. Value labels sit above each bar. Y axis 0–100 with "KES M" rotated label; horizontal gridlines in `grid`.

Header: title "Revenue vs Expenses", subtitle "Quarterly comparison, current year", a Quarterly/Monthly segmented toggle on the right, legend dots beneath.

Points where `isClosed` is false render no bar and no label.

**5.2 `TrendLineChart`** — Overview, right chart

Three lines across Jan–Dec: Revenue `brand.primary`, Expense `brand.secondary`, Net `brand.accent`. Circular markers at each point. Soft gradient area fill beneath. Y axis 0–100, "KES M".

**Marker alignment:** when drawing the line and the markers, both must use the same origin. An earlier version offset the line by the card's top padding while the markers used the card origin, so they separated. Keep one coordinate basis.

The line stops at the last closed month rather than dropping to zero.

**5.3 `TrendLineChart`** — Analysis variant

Two series: "This Year" solid in the page colour with markers, "Last Year" dashed in `muted`, no markers. Area fill under the current-year line.

**5.4 `CategoryBarChart`** — Analysis right panel

Horizontal rows: coloured dot + category name left, share percentage right in `ink` Bold, and a full-width track in `line` with a filled portion in the category colour beneath. Width is proportional to share, clamped at zero for negatives.

**Check:** overlay each against its Figma frame. Bar widths, corner treatment, marker positions and axis labels must match.

---

### Phase 6 — Overview page

**Deliverable:** `/finance/overview` complete.

Layout, top to bottom (content column `PX = 140`, width `CW = 1272`):

1. **Page header** — "CPF Group" in `ink` + "Finance" in `brand.blue`, both 28px Bold, on one line; subtitle "Group income statement overview" in `muted`. Filter bar right-aligned on the same band.
2. **KPI row** — four cards, equal width, from `useSummary`:
   - Total Revenue · `data.revenue` · `comparison.revenueChangePct` · teal tint, trending-up icon
   - Total Expenses · `data.expense` · `comparison.expenseChangePct` · pink tint, folder icon
   - Net · `data.net` · `comparison.netChangePct` · blue tint, bank icon
   - Net Margin · `data.netMarginPct` as a percentage · neutral "Net / Revenue" pill · yellow tint, percent icon
3. **Charts row** — `RevenueExpenseBar` left, `TrendLineChart` right, from `useTrend`.
4. **Tables row** — "Revenue by Category" left from `useBreakdown(filters, "revenue")`, "Expenses by Category" right from `useBreakdown(filters, "expense")`. Each has its icon beside the title.
5. **Breakdown by Company** — full-width card at the bottom.

**6.5 `CompanyBreakdown` in detail**

Card title "Breakdown by Company" 15px Bold; subtitle "CPF Group · revenue and expense share per company" in `muted`; the word "Total" small and right-aligned at the top.

One row per company, 52px apart. Each row:
- Company name left, in `ink`
- A single continuous bar, split into a revenue segment (`brand.primary`) and an expense segment (`brand.secondary`). Segment width is proportional to that segment's share of the company's revenue + expense.
- The percentage for each segment sits *above* it, in the segment's colour
- The amount sits *centred inside* its segment, in white
- The row total sits to the right of the bar, in `ink` Bold

A company returning 404 renders an outlined bar — `line` stroke, no fill — with "Not loaded" centred in `muted`, and `—` for the total.

**Group view with several companies:** bar length scales with each company's total, using a minimum length so the smallest amounts still fit inside their segments:

```
width = MIN + (BW − MIN) × (total − minTotal) / (maxTotal − minTotal)
```

with `MIN = 200`, `BW = 860`, bars starting at `BX = 320`. This is the formula behind the eight-company layout in the Design System page.

**Company view:** exactly one row, for the selected company. Nothing beneath it.

**Check:** against the Overview frame — all three rows inside the card, bar split at 51.4% / 48.6%, total KES 144.00M.

---

### Phase 7 — Revenue Analysis page

**Deliverable:** `/finance/revenue` complete.

1. Title "Revenue Analysis", subtitle "Revenue performance for CPF Group"
2. Four analysis KPI cards: Total Revenue (`data.revenue`), Previous Year (`comparison.revenue`), Revenue Growth (`comparison.revenueChangePct`), Reporting Period (`data.periodLabel` — rendered verbatim, never reconstructed)
3. Four `QuarterCard`s from `useTrend(filters, "quarter", true)`
4. Charts row: `TrendLineChart` analysis variant (wider, left) + `CategoryBarChart` (right), both revenue
5. "Revenue Categories" table from `useBreakdown(filters, "revenue")`

**Check:** against the Revenue frame.

---

### Phase 8 — Expense Analysis page

**Deliverable:** `/finance/expenses` complete.

Mirrors Phase 7 with `type="expense"`, `brand.secondary` as the page colour, titles "Expense Analysis" / "Expense Trend" / "Expenses by Category" / "Expense Categories", and the Expense Change card reading `comparison.expenseChangePct`.

**Favourability:** on this page a negative change is favourable and shows in `positive` colours — as the design does, with −6.67% in green.

**Check:** against the Expense frame.

---

### Phase 9 — States

**Deliverable:** every screen behaves when data is absent, partial or failing.

| State | Treatment |
|---|---|
| Loading | Skeleton blocks at the final dimensions of each card and chart, so layout does not shift |
| `DATA_NOT_AVAILABLE` (whole page) | "No data for this period yet." plus an action offering the latest period from `/periods` |
| `DATA_NOT_AVAILABLE` (one company) | That row reads "Not loaded"; the rest of the card renders |
| `FORBIDDEN_COMPANY` | Remove the company from the dropdown; if it was selected, fall back to group view |
| `UNAUTHENTICATED` | Sign-in prompt |
| `INTERNAL_ERROR` | Generic message, the request ID shown so users can quote it, and a retry |
| Incomplete quarter / month | `—` on cards, no bar on charts, line stops |

Per the frontend guide, branch on `error.code`, never on the HTTP status.

Per Core Design Principles §2, "degrade gently": one failing panel must not blank a working page.

---

### Phase 10 — Verification

**Deliverable:** signed-off parity with Figma.

1. Screenshot each route at 1440px and place it beside its Figma frame
2. Walk the component checklist in §6 below
3. Exercise every filter combination against the real API
4. Switch to company view and confirm each screen narrows correctly
5. Confirm the Breakdown card's "Not loaded" rows for companies that are not yet loaded
6. Keyboard-navigate the filter bar and nav; check contrast on the badges

---

## 6. Verification checklist

Run before declaring any screen done.

### Shell
- [ ] Header 56px, `brand.blue`, logo + wordmark + "Financial Reporting ⌄" + search + avatar
- [ ] Sidebar 120px, white, Finance group with three items
- [ ] Active tab tinted, 4px far-left indicator, correct colour per page
- [ ] Filter bar right-aligned with four dropdowns and Apply Filters
- [ ] Selecting Quarter resets Month, and the reverse

### Overview
- [ ] Title "CPF Group" + "Finance", subtitle beneath
- [ ] Four KPI cards with icon tiles, correct tints, correct badges
- [ ] Net Margin shows the neutral "Net / Revenue" pill
- [ ] Bar chart: sharp corners, thin bars, labels above, "KES M" axis
- [ ] Trend chart: three series, markers aligned to the line, gradient fill
- [ ] Both category tables with four columns and coloured dots
- [ ] Breakdown card: three rows inside the card, split bar, % above, amount centred, total right
- [ ] "Not loaded" rows outlined, with `—` totals

### Revenue / Expense
- [ ] Four KPI cards with coloured left borders
- [ ] Reporting Period reads the API `periodLabel` verbatim
- [ ] Four quarter cards with "vs Qn 2025" captions
- [ ] Trend chart: This Year solid with markers, Last Year dashed
- [ ] Category bars: dot, name, percentage, proportional track
- [ ] Categories table matching the Overview table's structure

### Data correctness
- [ ] Every percentage passes through `formatPercent`; nulls render `—`
- [ ] Every amount passes through `formatCurrency` with the response `currency`
- [ ] No percentage multiplied by 100 — the API already scales them
- [ ] Group view omits `companyIds`; company view sends exactly one
- [ ] Trend ignores quarter and month, as the contract specifies

---

## 7. Testing strategy

Following your Clean Coding Practices §10 — small, fast, independent, repeatable, one behaviour per test.

### 7.1 Unit — `lib/calculations.ts` and `lib/utils.ts`

The highest-value tests in the project, because these functions are pure and every screen depends on them.

```
formatCurrency      74000000, "KES"        → "KES 74.00M"
formatCurrency      -2500000, "KES"        → "-KES 2.50M"
formatPercent       2.78                   → "+2.78%"
formatPercent       null                   → "—"
splitPercentages    74000000, 70000000     → { 51.4, 48.6 }
segmentWidths       negative revenue       → clamped at 0
closedPoints        mixed isClosed         → only closed points
```

Tool: Vitest. No mocks needed — these take values and return values.

### 7.2 Component — React Testing Library

- `KpiCard` renders `—` when `changePct` is null
- `QuarterCard` renders `—` when the quarter is not closed
- `CategoryTable` renders one row per item and marks Others non-interactive
- `CompanyBreakdown` renders "Not loaded" for a company whose query 404s

### 7.3 Integration — MSW

Mock the API at the network boundary with the exact example payloads from `dart-api.yaml`, so tests exercise the real parsing path:

- Overview populates all four KPIs from the summary example
- A 404 on one company leaves the other rows rendered
- A 500 shows the request ID
- Applying a quarter filter refires summary and breakdown but not trend

### 7.4 End-to-end — Playwright, later

Once the API is reachable from CI: load each route, apply filters, switch company, assert the headline figures.

### 7.5 Quality gates in CI

```
npm run lint        →  ESLint, zero errors
npx tsc --noEmit    →  zero type errors
npm run test        →  all tests pass
npm run build       →  production build succeeds
```

---

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Only LITES is loaded | Group totals equal one company; the Breakdown card is mostly "Not loaded" | Expected and designed for. Do not special-case it away. |
| Current year is partial | Q2–Q4 are null; charts look sparse | Phase 9 covers this. Test against a complete prior year as well. |
| N+1 company calls | Slow Breakdown card as companies are added | `useQueries` fires in parallel; cache for the filter set. Revisit only if it measurably hurts. |
| Figures in Figma are samples | Quarter cards do not sum to the KPI totals | Known. Real data is internally consistent; do not "fix" the design. |
| Drill-down deferred | Category rows look clickable but are not | Render them non-interactive — no pointer cursor, no hover affordance. |
| Auth not yet wired | Dev runs tokenless; production needs Bearer | Keep the header injection point in `client.ts` so it is one change later. |

---

## 9. What "done" means

A screen is done when:

1. It matches its Figma frame at 1440px — layout, colour, type, spacing
2. Every value comes from the API, with no hard-coded figures left in components
3. Loading, error and empty states render without layout shift
4. Group view and company view both work
5. Nulls render `—` everywhere, never `NaN`, `null` or `0`
6. Lint, typecheck, tests and build all pass
7. No component imports Axios, Recharts or TanStack Query outside its designated directory

---

## 10. Build order summary

| Phase | Deliverable | Depends on |
|---|---|---|
| 0 | Toolchain running | — |
| 1 | Tokens and primitives | 0 |
| 2 | Data layer and pure functions | 0 |
| 3 | Application shell | 1, 2 |
| 4 | Cards and tables | 1, 2 |
| 5 | Charts | 1, 2 |
| 6 | Overview page | 3, 4, 5 |
| 7 | Revenue page | 3, 4, 5 |
| 8 | Expense page | 7 |
| 9 | States | 6, 7, 8 |
| 10 | Verification | 9 |

Phases 1 and 2 run in parallel. Phases 4 and 5 run in parallel. Phase 8 follows 7 closely because it mirrors it.
