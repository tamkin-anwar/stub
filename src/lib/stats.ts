import type { ListEntry } from "./types";
import { ratingFor } from "./format";

export interface GenreCount {
  name: string;
  count: number;
}

export interface YearStats {
  year: number;
  watchedCount: number;
  hours: number;
  filmCount: number;
  seriesCount: number;
  ratedCount: number;
  avgRating: number | null;
  topGenres: GenreCount[];
  topRated: { name: string; stars: number } | null;
  rewatchedCount: number;
  busiestMonth: { month: number; count: number } | null;
}

function yearOf(dateStr: string): number {
  return Number(dateStr.slice(0, 4));
}

/** Years with at least one watched title, newest first, with the current
 *  year always included so a brand-new account still has something to see. */
export function availableYears(entries: ListEntry[]): number[] {
  const years = new Set<number>([new Date().getFullYear()]);
  for (const e of entries) {
    if (e.status === "watched" && e.watched_on) years.add(yearOf(e.watched_on));
  }
  return [...years].sort((a, b) => b - a);
}

export function computeYearStats(entries: ListEntry[], year: number, selfId: string): YearStats {
  const watched = entries.filter(
    (e) => e.status === "watched" && e.watched_on && yearOf(e.watched_on) === year,
  );

  const hours = Math.round(
    watched.reduce((acc, e) => {
      const rt = e.title.runtime ?? 0;
      return acc + (e.title.media_type === "movie" ? rt : rt * 10);
    }, 0) / 60,
  );

  const genreCounts = new Map<string, number>();
  for (const e of watched) {
    for (const g of e.title.genres) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
  }
  const topGenres = [...genreCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const myRatings = watched
    .map((e) => ({ e, stars: ratingFor(e, selfId) }))
    .filter((r): r is { e: ListEntry; stars: number } => r.stars != null);
  const avgRating =
    myRatings.length > 0
      ? Math.round((myRatings.reduce((acc, r) => acc + r.stars, 0) / myRatings.length) * 10) / 10
      : null;
  const topRatedEntry = myRatings.sort((a, b) => b.stars - a.stars)[0] ?? null;

  const monthCounts = new Map<number, number>();
  for (const e of watched) {
    const m = Number(e.watched_on!.slice(5, 7)) - 1;
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
  }
  const busiestEntry = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    year,
    watchedCount: watched.length,
    hours,
    filmCount: watched.filter((e) => e.title.media_type === "movie").length,
    seriesCount: watched.filter((e) => e.title.media_type === "tv").length,
    ratedCount: myRatings.length,
    avgRating,
    topGenres,
    topRated: topRatedEntry ? { name: topRatedEntry.e.title.name, stars: topRatedEntry.stars } : null,
    rewatchedCount: watched.filter((e) => e.rewatch_count > 0).length,
    busiestMonth: busiestEntry ? { month: busiestEntry[0], count: busiestEntry[1] } : null,
  };
}
