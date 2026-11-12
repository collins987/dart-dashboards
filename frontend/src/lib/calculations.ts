/**
 * Whether a rise in a metric is good news. Revenue and net read one way,
 * expense the other, so the caller states which rather than the colour
 * being guessed from the sign.
 */
export type MetricDirection = "higher-is-better" | "lower-is-better";

export type ChangeTone = "positive" | "negative" | "neutral";

export type ChangeDirection = "up" | "down" | "none";

/** Arrow glyph direction. Follows the sign of the change, not its desirability. */
export function changeDirection(changePct: number | null): ChangeDirection {
  if (changePct === null || changePct === 0) return "none";
  return changePct > 0 ? "up" : "down";
}

/** Badge colour. Follows desirability, so a fall in expense reads as good news. */
export function changeTone(
  changePct: number | null,
  direction: MetricDirection
): ChangeTone {
  if (changePct === null || changePct === 0) return "neutral";
  const isRise = changePct > 0;
  const isGood = direction === "higher-is-better" ? isRise : !isRise;
  return isGood ? "positive" : "negative";
}

export interface SplitPercentages {
  revenuePct: number | null;
  expensePct: number | null;
}

/**
 * Each side's share of a company's combined revenue and expense, as shown
 * above the segments of the Breakdown by Company bar.
 */
export function splitPercentages(revenue: number, expense: number): SplitPercentages {
  const total = revenue + expense;
  if (total === 0) return { revenuePct: null, expensePct: null };
  return {
    revenuePct: (revenue / total) * 100,
    expensePct: (expense / total) * 100,
  };
}

/**
 * Period-on-period change, matching the API's own definition so figures the
 * frontend derives agree with figures the API sends.
 */
export function changePct(current: number | null, prior: number | null): number | null {
  if (current === null || prior === null || prior === 0) return null;
  return ((current - prior) / Math.abs(prior)) * 100;
}
