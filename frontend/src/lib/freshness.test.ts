import { describe, it, expect } from "vitest";
import { freshnessOf, STALE_AFTER_DAYS } from "./freshness";

const NOW = new Date("2026-11-12T12:00:00Z");

describe("freshnessOf", () => {
  it("marks very recent data as fresh and 'just now'", () => {
    const f = freshnessOf("2026-11-12T11:59:30Z", NOW);
    expect(f.status).toBe("fresh");
    expect(f.relative).toBe("just now");
  });

  it("reports hours and days ago", () => {
    expect(freshnessOf("2026-11-12T09:00:00Z", NOW).relative).toBe("3 hours ago");
    expect(freshnessOf("2026-11-09T12:00:00Z", NOW).relative).toBe("3 days ago");
  });

  it("uses singular units for one", () => {
    expect(freshnessOf("2026-11-11T12:00:00Z", NOW).relative).toBe("1 day ago");
  });

  it("is fresh at the threshold and stale just past it", () => {
    const atThreshold = new Date(NOW.getTime() - STALE_AFTER_DAYS * 86_400_000).toISOString();
    expect(freshnessOf(atThreshold, NOW).status).toBe("fresh");

    const pastThreshold = new Date(
      NOW.getTime() - (STALE_AFTER_DAYS * 86_400_000 + 60_000)
    ).toISOString();
    expect(freshnessOf(pastThreshold, NOW).status).toBe("stale");
  });

  it("handles missing or invalid timestamps as unknown", () => {
    expect(freshnessOf(null, NOW).status).toBe("unknown");
    expect(freshnessOf("not-a-date", NOW).status).toBe("unknown");
  });

  it("treats a future timestamp (clock skew) as just now and fresh", () => {
    const f = freshnessOf("2026-11-12T12:05:00Z", NOW);
    expect(f.status).toBe("fresh");
    expect(f.relative).toBe("just now");
  });
});
