import { describe, expect, it } from "vitest";
import { availableYears, computeYearStats } from "./stats";
import type { ListEntry } from "./types";

const ME = "me";

interface EntryFixture {
  id?: string;
  status?: string;
  watched_on?: string | null;
  rewatch_count?: number;
  ratings?: { user_id: string; stars: number }[];
  genres?: string[];
  title?: Record<string, unknown>;
}

function entry(overrides: EntryFixture): ListEntry {
  return {
    id: overrides.id ?? Math.random().toString(),
    status: "watched",
    watched_on: "2026-06-15",
    rewatch_count: 0,
    note: "",
    ratings: [],
    title: {
      name: "Untitled",
      media_type: "movie",
      runtime: 120,
      genres: overrides.genres ?? [],
    },
    ...overrides,
  } as unknown as ListEntry;
}

describe("computeYearStats", () => {
  it("only counts watched titles from the requested year", () => {
    const entries = [
      entry({ watched_on: "2026-01-10" }),
      entry({ watched_on: "2025-12-31" }),
      entry({ status: "watchlist", watched_on: null }),
    ];
    const stats = computeYearStats(entries, 2026, ME);
    expect(stats.watchedCount).toBe(1);
  });

  it("estimates hours: movies at their runtime, series at 10x an episode", () => {
    const entries = [
      entry({ watched_on: "2026-01-01", title: { media_type: "movie", runtime: 120, genres: [], name: "Film" } as never }),
      entry({ watched_on: "2026-01-02", title: { media_type: "tv", runtime: 30, genres: [], name: "Show" } as never }),
    ];
    // 120 + 30*10 = 420 minutes = 7 hours
    expect(computeYearStats(entries, 2026, ME).hours).toBe(7);
  });

  it("counts films and series separately", () => {
    const entries = [
      entry({ watched_on: "2026-01-01", title: { media_type: "movie", runtime: 100, genres: [], name: "A" } as never }),
      entry({ watched_on: "2026-01-02", title: { media_type: "tv", runtime: 30, genres: [], name: "B" } as never }),
      entry({ watched_on: "2026-01-03", title: { media_type: "tv", runtime: 30, genres: [], name: "C" } as never }),
    ];
    const stats = computeYearStats(entries, 2026, ME);
    expect(stats.filmCount).toBe(1);
    expect(stats.seriesCount).toBe(2);
  });

  it("ranks genres by how many watched titles had them", () => {
    const entries = [
      entry({ watched_on: "2026-01-01", genres: ["Drama", "Crime"] }),
      entry({ watched_on: "2026-01-02", genres: ["Drama"] }),
      entry({ watched_on: "2026-01-03", genres: ["Comedy"] }),
    ];
    const stats = computeYearStats(entries, 2026, ME);
    expect(stats.topGenres[0]).toEqual({ name: "Drama", count: 2 });
  });

  it("averages only the viewer's own rating, not a shared partner's", () => {
    const entries = [
      entry({ watched_on: "2026-01-01", ratings: [{ user_id: ME, stars: 4 }, { user_id: "them", stars: 1 }] }),
      entry({ watched_on: "2026-01-02", ratings: [{ user_id: ME, stars: 5 }] }),
      entry({ watched_on: "2026-01-03", ratings: [{ user_id: "them", stars: 5 }] }),
    ];
    const stats = computeYearStats(entries, 2026, ME);
    expect(stats.ratedCount).toBe(2);
    expect(stats.avgRating).toBe(4.5);
  });

  it("picks the viewer's highest-rated watch of the year", () => {
    const entries = [
      entry({ watched_on: "2026-01-01", title: { name: "Low", media_type: "movie", runtime: 90, genres: [] } as never, ratings: [{ user_id: ME, stars: 3 }] }),
      entry({ watched_on: "2026-01-02", title: { name: "High", media_type: "movie", runtime: 90, genres: [] } as never, ratings: [{ user_id: ME, stars: 5 }] }),
    ];
    expect(computeYearStats(entries, 2026, ME).topRated).toEqual({ name: "High", stars: 5 });
  });

  it("is null, not zero, when nothing was rated", () => {
    const entries = [entry({ watched_on: "2026-01-01", ratings: [] })];
    const stats = computeYearStats(entries, 2026, ME);
    expect(stats.avgRating).toBeNull();
    expect(stats.topRated).toBeNull();
  });

  it("counts titles rewatched at least once", () => {
    const entries = [
      entry({ watched_on: "2026-01-01", rewatch_count: 2 }),
      entry({ watched_on: "2026-01-02", rewatch_count: 0 }),
    ];
    expect(computeYearStats(entries, 2026, ME).rewatchedCount).toBe(1);
  });

  it("finds the month with the most watches", () => {
    const entries = [
      entry({ watched_on: "2026-03-01" }),
      entry({ watched_on: "2026-03-15" }),
      entry({ watched_on: "2026-07-04" }),
    ];
    expect(computeYearStats(entries, 2026, ME).busiestMonth).toEqual({ month: 2, count: 2 });
  });
});

describe("availableYears", () => {
  it("always includes the current year, even with no history", () => {
    expect(availableYears([])).toEqual([new Date().getFullYear()]);
  });

  it("lists every year with a watched title, newest first, deduped", () => {
    const entries = [
      entry({ watched_on: "2024-01-01" }),
      entry({ watched_on: "2024-06-01" }),
      entry({ watched_on: "2022-01-01" }),
    ];
    const years = availableYears(entries);
    expect(years).toContain(2024);
    expect(years).toContain(2022);
    expect(years.indexOf(2024)).toBeLessThan(years.indexOf(2022));
  });
});
