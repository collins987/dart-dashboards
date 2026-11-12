import { describe, it, expect } from "vitest";
import {
  changeDirection,
  changeTone,
  splitPercentages,
  changePct,
} from "./calculations";

describe("changeDirection", () => {
  it("points up for a rise", () => {
    expect(changeDirection(2.78)).toBe("up");
  });

  it("points down for a fall, even when the fall is good news", () => {
    expect(changeDirection(-6.67)).toBe("down");
  });

  it("has no direction when the change is null", () => {
    expect(changeDirection(null)).toBe("none");
  });

  it("has no direction when the change is zero", () => {
    expect(changeDirection(0)).toBe("none");
  });
});

describe("changeTone", () => {
  it("reads a revenue rise as good news", () => {
    expect(changeTone(2.78, "higher-is-better")).toBe("positive");
  });

  it("reads a revenue fall as bad news", () => {
    expect(changeTone(-1.1, "higher-is-better")).toBe("negative");
  });

  it("reads an expense fall as good news", () => {
    expect(changeTone(-6.67, "lower-is-better")).toBe("positive");
  });

  it("reads an expense rise as bad news", () => {
    expect(changeTone(1.8, "lower-is-better")).toBe("negative");
  });

  it("is neutral when the change is null", () => {
    expect(changeTone(null, "higher-is-better")).toBe("neutral");
  });
});

describe("splitPercentages", () => {
  it("splits the LITES figures as the design shows", () => {
    const { revenuePct, expensePct } = splitPercentages(74_000_000, 70_000_000);
    expect(revenuePct).toBeCloseTo(51.4, 1);
    expect(expensePct).toBeCloseTo(48.6, 1);
  });

  it("returns nulls when there is nothing to split", () => {
    expect(splitPercentages(0, 0)).toEqual({ revenuePct: null, expensePct: null });
  });
});

describe("changePct", () => {
  it("matches the API's own comparison figure", () => {
    expect(changePct(74_000_000, 72_000_000)).toBeCloseTo(2.78, 2);
  });

  it("uses the magnitude of the prior value, so a swing from a loss reads positive", () => {
    expect(changePct(4_000_000, -3_000_000)).toBeCloseTo(233.33, 2);
  });

  it("is null when the prior value is zero", () => {
    expect(changePct(100, 0)).toBeNull();
  });

  it("is null when the current period has not closed", () => {
    expect(changePct(null, 72_000_000)).toBeNull();
  });
});
