# DART API: Front-end Integration Guide

* `docs/dart-api.yaml` (version 1.0.0).*

## 1. Development API base URL

```
http://localhost:8000/api/v1
```

The interactive docs are at `http://localhost:8000/docs`. The staging and production URLs in the YAML (`reporting-api.staging.example.com` and `reporting-api.example.com`) are placeholders until a server is set up.

## 2. Endpoints ready for testing

All six endpoints in `dart-api.yaml` are built.
| Endpoint | Purpose |
| --- | --- |
| `GET /companies` | Company filter dropdown |
| `GET /periods` | Years with data, and the latest complete month |
| `GET /financials/summary` | KPI cards |
| `GET /financials/trend` | Monthly or quarterly chart |
| `GET /financials/breakdown` | Category pie or bar chart |
| `GET /financials/categories/{categoryId}/accounts` | Account drill-down |

Only LITES data is loaded so far. The other five companies will be added after LITES is reconciled with Finance.

## 3. Sample responses

These are real API output from the test dataset, so the figures are small, made-up numbers. The structure is exactly what you'll get from real data.

### Summary

`GET /financials/summary?year=2026&quarter=1`

```json
{
  "currency": "KES",
  "dataAsOf": "2026-11-08T21:00:00Z",
  "appliedFilters": { "companyIds": ["LITES", "LPS"], "year": 2026, "quarter": 1, "month": null },
  "data": {
    "revenue": 4500.0,
    "expense": 3000.0,
    "net": 1500.0,
    "periodLabel": "Q1 2026",
    "netMarginPct": 33.33,
    "comparison": {
      "label": "Q1 2025",
      "revenue": 4500.0,
      "expense": 3000.0,
      "net": 1500.0,
      "revenueChangePct": 0.0,
      "expenseChangePct": 0.0,
      "netChangePct": 0.0
    }
  }
}
```

### Trend

`GET /financials/trend?year=2026&granularity=quarter&includePriorYear=true`

This shows the first two of the four points; months that aren't complete come back with null amounts.

```json
{
  "currency": "KES",
  "dataAsOf": "2026-11-08T21:00:00Z",
  "appliedFilters": { "companyIds": ["LITES", "LPS"], "year": 2026, "granularity": "quarter", "includePriorYear": true },
  "data": [
    {
      "period": "2026-Q1", "label": "Q1", "isClosed": true,
      "revenue": 4500.0, "expense": 3000.0, "net": 1500.0,
      "priorYear": { "revenue": 4500.0, "expense": 3000.0, "net": 1500.0 }
    },
    {
      "period": "2026-Q2", "label": "Q2", "isClosed": false,
      "revenue": null, "expense": null, "net": null,
      "priorYear": { "revenue": 4500.0, "expense": 3000.0, "net": 1500.0 }
    }
  ]
}
```

### Breakdown

`GET /financials/breakdown?year=2026&quarter=1&type=expense&top=1`

```json
{
  "currency": "KES",
  "dataAsOf": "2026-11-08T21:00:00Z",
  "appliedFilters": { "companyIds": ["LITES", "LPS"], "year": 2026, "quarter": 1, "month": null, "type": "expense", "top": 1 },
  "total": 3000.0,
  "data": [
    { "categoryId": "EXP-OPEX", "categoryName": "Operating Expenses", "amount": 2100.0, "sharePct": 70.0, "priorYearAmount": 2100.0, "changePct": 0.0 },
    { "categoryId": "OTHERS", "categoryName": "Others", "amount": 900.0, "sharePct": 30.0, "priorYearAmount": 900.0, "changePct": 0.0 }
  ]
}
```

### Things the front end should handle

- **Number formatting.** Amounts come as JSON numbers, so `4500.00` arrives as `4500.0`. Format to 2 decimals for display.
- **Partly finished periods.** If the selected period isn't finished, the summary covers only its complete months. `periodLabel` and `comparison.label` say which months, for example "Jan–May 2026". Show these labels rather than building your own.
- **Nullable fields.** `netMarginPct`, `sharePct` and the `*ChangePct` fields can be `null` when the base they divide by is zero.
- **Negative amounts.** A category amount can be negative; on the real LITES data, an FX loss produces one. Pie charts need a fallback for that.

## 4. Authentication

- **Development:** no token needed. The API runs as a fixed user whose role (GMD, EXCO or ED) and companies are set in its configuration.
- **Production:** every request needs `Authorization: Bearer <JWT>`. The token must carry the user's role and their list of companies.
- **Without a valid token:** 401 with code `UNAUTHENTICATED`.
- **Company not allowed for this user:** 403 with code `FORBIDDEN_COMPANY`.

## 5. Error structure

Every error, for every status, uses the same shape:

```json
{
  "error": {
    "code": "DATA_NOT_AVAILABLE",
    "message": "Jun 2026 is not complete yet.",
    "requestId": "req_303aa67272e4",
    "details": [ { "field": "month", "issue": "..." } ]
  }
}
```

- **`details`** appears only on validation errors (400).
- **`message`** is safe to show to users.
- **`requestId`** is also sent in the `X-Request-ID` header on every response, successful or not. Show it on error screens so users can quote it.

Branch on `code`, not on the HTTP status:

| Status | `code` | Meaning | Suggested UI |
| --- | --- | --- | --- |
| 404 | `DATA_NOT_AVAILABLE` | No data for that year, or the period isn't complete yet | "No data for this period yet." Offer the latest period from `/periods`. |
| 404 | `NOT_FOUND` | Unknown category in the drill-down, including `OTHERS` | Disable drill-down on the Others slice. |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Generic message plus the request ID; allow a retry. |
| 400 | `VALIDATION_ERROR` | Invalid filters, such as quarter and month together | Shouldn't happen if the UI controls filters. |
| 401 / 403 | `UNAUTHENTICATED` / `FORBIDDEN_COMPANY` | See section 4 | Sign-in prompt, or hide the company. |


- Validation errors return 400 instead of FastAPI's default 422.
- `DATA_NOT_AVAILABLE` returns a 404 on the financial endpoints.

