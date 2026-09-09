import { describe, expect, it } from "vitest";
import {
  displayName,
  entryAverage,
  hashIndex,
  initials,
  posterGradient,
  ratingFor,
  runtimeLabel,
  statusLabel,
  timeAgo,
} from "./format";
import type { ListEntry } from "./types";

function entry(ratings: { user_id: string; stars: number }[]): ListEntry {
  return { ratings, status: "watched" } as unknown as ListEntry;
}

describe("hashIndex", () => {
  it("is deterministic and stays in range", () => {
    expect(hashIndex("interstellar", 12)).toBe(hashIndex("interstellar", 12));
    for (const s of ["a", "", "The Matrix", "长城", "🎬"]) {
      const i = hashIndex(s, 7);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(7);
    }
  });

  it("spreads different inputs across buckets", () => {
    const seen = new Set(
      Array.from({ length: 50 }, (_, n) => hashIndex(`title ${n}`, 12)),
    );
    expect(seen.size).toBeGreaterThan(4);
  });
});

describe("posterGradient", () => {
  it("returns a stable pair for the same seed", () => {
    expect(posterGradient("Dune")).toEqual(posterGradient("Dune"));
    const g = posterGradient("Dune");
    expect(g.d).toMatch(/^#[0-9a-f]{6}$/i);
    expect(g.m).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("initials", () => {
  it("handles one word, two words, many words and blanks", () => {
    expect(initials("Alex")).toBe("Al");
    expect(initials("Alex Rivera")).toBe("AR");
    expect(initials("mary jane watson")).toBe("MW");
    expect(initials("   ")).toBe("?");
    expect(initials("x")).toBe("x");
  });
});

describe("displayName", () => {
  it("prefers a non-blank display name, else the username", () => {
    expect(displayName({ display_name: "Alex", username: "alex99" })).toBe("Alex");
    expect(displayName({ display_name: "   ", username: "alex99" })).toBe("alex99");
    expect(displayName({ display_name: "", username: "alex99" })).toBe("alex99");
  });
});

describe("entryAverage", () => {
  it("is null with no ratings", () => {
    expect(entryAverage(entry([]))).toBeNull();
  });
  it("returns a single rating as-is", () => {
    expect(entryAverage(entry([{ user_id: "a", stars: 4 }]))).toBe(4);
  });
  it("averages and rounds to one decimal", () => {
    expect(
      entryAverage(entry([{ user_id: "a", stars: 4 }, { user_id: "b", stars: 3 }])),
    ).toBe(3.5);
    expect(
      entryAverage(entry([{ user_id: "a", stars: 5 }, { user_id: "b", stars: 2 }])),
    ).toBe(3.5);
    expect(
      entryAverage(entry([{ user_id: "a", stars: 4 }, { user_id: "b", stars: 4 }, { user_id: "c", stars: 3 }])),
    ).toBe(3.7);
  });
});

describe("ratingFor", () => {
  const e = entry([{ user_id: "me", stars: 5 }, { user_id: "you", stars: 2 }]);
  it("finds the rating for a given user", () => {
    expect(ratingFor(e, "me")).toBe(5);
    expect(ratingFor(e, "you")).toBe(2);
  });
  it("is null for someone who has not rated", () => {
    expect(ratingFor(e, "stranger")).toBeNull();
  });
});

describe("runtimeLabel", () => {
  it("is null without a runtime", () => {
    expect(runtimeLabel(null, "movie")).toBeNull();
    expect(runtimeLabel(0, "movie")).toBeNull();
  });
  it("formats films as hours and minutes", () => {
    expect(runtimeLabel(142, "movie")).toBe("2h 22m");
    expect(runtimeLabel(47, "movie")).toBe("47m");
    expect(runtimeLabel(120, "movie")).toBe("2h 0m");
  });
  it("labels series by episode length", () => {
    expect(runtimeLabel(50, "tv")).toBe("50 min episodes");
  });
});

describe("statusLabel", () => {
  it("capitalises the three states", () => {
    expect(statusLabel("watchlist")).toBe("Watchlist");
    expect(statusLabel("watching")).toBe("Watching");
    expect(statusLabel("watched")).toBe("Watched");
  });
});

describe("timeAgo", () => {
  const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();
  it("uses compact units up to a month, then falls back to a date", () => {
    expect(timeAgo(iso(5_000))).toBe("just now");
    expect(timeAgo(iso(5 * 60_000))).toBe("5m");
    expect(timeAgo(iso(3 * 3_600_000))).toBe("3h");
    expect(timeAgo(iso(2 * 86_400_000))).toBe("2d");
    expect(timeAgo(iso(3 * 7 * 86_400_000))).toBe("3w");
    expect(timeAgo("2020-01-15T00:00:00Z")).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});
