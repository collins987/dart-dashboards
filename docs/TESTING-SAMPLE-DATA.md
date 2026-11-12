# Testing the dashboards with sample data

Written for: the developer testing the dashboards on their own machine.

This guide covers the `testing` branch, which runs the dashboards on sample data with no backend. Use `main` only for production code. `main` has no sample data, so it shows errors on `localhost:3000` until the real API is running.

---

## 1. One-time setup

Run these from the project root, `c:\Users\vince\projects\Dart V2`:

```
git checkout testing
cd frontend
npm install
```

You do not need `frontend/.env.local` for sample data. Sample mode answers every request inside the app, so no request reaches `API_BASE_URL`.

## 2. Start the app

```
cd frontend
npm run dev
```

Open `http://localhost:3000/finance/overview`.

If you switch branches while the dev server is running, stop it (Ctrl+C) and start it again.

## 3. What you should see

- **Year filter**: 2021 to 2026. The default is 2026.
- **Overview cards**: values change when you change the year. Revenue is roughly 635M (2021), 726M (2022), 800M (2023), 780M (2024), 936M (2025) and 799M (Jan–Nov 2026) — year-on-year growth swings between about -5% and +20%, not a steady line. Expenses follow their own pattern.
- **Trend chart shape**: the month-to-month curve differs from year to year (one year dips mid-year, another climbs steadily), and the category mix shifts a little each year, so no two years look alike.
- **Period label**: "Jan–Nov 2026" for the 2026 year. 2025 and earlier show the plain year.
- **Quarter and month filters**: Q4 2026 shows "Oct–Nov 2026" (December is not closed). December 2026 shows the "No data for this period yet" message with a button to "Show Jan–Nov 2026".
- **Company filter**: LITES, CPF FS and CPF C&A each show their own figures. The group total is the sum of the three.
- **Breakdown charts**: three categories per revenue and expense chart, sorted by amount. Sharing percentages add up to 100.
- **Trend charts**: Jan to Dec for 2026, with December empty.

## 4. Automated checks

Run these from `frontend/`:

```
npm run test        # 75 tests: data contract, totals, labels, error codes
npm run typecheck   # TypeScript
npm run lint        # ESLint
```

The data contract tests check that totals agree across the summary, trend, breakdown and account endpoints.

## 5. Changing the sample figures

Edit `frontend/scripts/data.seed.ts`. Then regenerate the data and run the tests:

```
cd frontend
npm run generate:data
npm run test
```

Things you can change in the seed:

- `yearFactor`: a multiplier per year. This is what makes each year look different. Values further from 1.0 make the years move more.
- `companyData`: monthly figures per company and category, in millions of KES, for 2026. Earlier years are derived from them using each series' `yoyPct`.
- `categories`: category names, and the account names and their weights.
- `latestClosed`: the last complete month (currently 2026, month 11). Later months return "no data".

Do not edit `frontend/src/data.ts` by hand. It is overwritten each time the generator runs.

## 6. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Every section shows "Something went wrong" | You are on `main`, or the dev server is still running a previous branch | `git checkout testing`, then restart `npm run dev` |
| All years look the same | Old data, from before `yearFactor` was added | `npm run generate:data`, then reload the page |
| Changes to the seed have no effect | Generator not run | `npm run generate:data` |
| Test `sample.test.ts` fails after editing the seed | A total or label no longer matches the spec rules | Read the failing assertion; the rules are in section 6 of `docs/SAMPLE-DATA-AND-PRODUCTION-CLEANUP.md` |
| Page is slow to open the first time | The 5 MB `data.ts` is compiled on first use | Wait for the first load; later loads are faster |

## 7. Going back to production

```
git checkout main
```

Restart `npm run dev` after switching. On `main`, set `API_BASE_URL` in `frontend/.env.local` to the real API before testing against it.
