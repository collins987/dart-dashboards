/**
 * Which months have closed data. Pure functions: the current year and the
 * present month index are passed in, so the rules can be tested without the clock.
 */

const ALL_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** Zero-based index of the present calendar month, capped to the year. */
export function presentMonthIndex(now: Date = new Date()): number {
  return Math.min(now.getMonth(), 11);
}

/** Zero-based month indices that have closed data for a year. */
export function closedMonths(
  year: number,
  currentYear: number,
  presentMonth: number
): number[] {
  if (year < currentYear) return ALL_MONTHS;
  if (year > currentYear) return [];
  return ALL_MONTHS.slice(0, presentMonth + 1);
}

/** Zero-based month indices covered by a quarter (1–4) or month (1–12) selection. */
export function periodMonths(
  year: number,
  quarter: number | null,
  month: number | null,
  currentYear: number,
  presentMonth: number
): number[] {
  if (month) return [month - 1];
  if (quarter) {
    const start = (quarter - 1) * 3;
    return [start, start + 1, start + 2];
  }
  return closedMonths(year, currentYear, presentMonth);
}

/** A period is usable only when it has months and every one of them is closed. */
export function isPeriodClosed(
  months: number[],
  year: number,
  currentYear: number,
  presentMonth: number
): boolean {
  if (months.length === 0) return false;
  const closed = closedMonths(year, currentYear, presentMonth);
  return months.every((m) => closed.includes(m));
}
