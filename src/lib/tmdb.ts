import { env, tmdbReady } from "./env";
import type { MediaType, TmdbDetail, TmdbTitle } from "./types";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" = "w342") {
  return path ? `${IMG}/${size}${path}` : null;
}
export function backdropUrl(path: string | null, size: "w780" | "w1280" = "w1280") {
  return path ? `${IMG}/${size}${path}` : null;
}
export function profileUrl(path: string | null, size: "w185" = "w185") {
  return path ? `${IMG}/${size}${path}` : null;
}

async function tmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!tmdbReady) throw new Error("TMDB is not configured. Set VITE_TMDB_ACCESS_TOKEN in .env.");
  const qs = new URLSearchParams({ language: "en-US", ...toStringRecord(params) });
  const res = await fetch(`${BASE}${path}?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${env.tmdbToken}`, accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TMDB ${res.status}: ${body.slice(0, 160)}`);
  }
  return res.json() as Promise<T>;
}

function toStringRecord(r: Record<string, string | number>): Record<string, string> {
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)]));
}

function yearOf(date?: string | null): number | null {
  if (!date) return null;
  const y = Number(date.slice(0, 4));
  return Number.isFinite(y) && y > 1870 ? y : null;
}

interface RawResult {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
}

interface RawPage {
  results: RawResult[];
  page: number;
  total_pages: number;
}

function normalize(raw: RawResult, forced?: MediaType): TmdbTitle | null {
  const mediaType = (forced ?? raw.media_type) as MediaType | undefined;
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  return {
    tmdbId: raw.id,
    mediaType,
    name: raw.title ?? raw.name ?? raw.original_title ?? raw.original_name ?? "Untitled",
    year: yearOf(raw.release_date ?? raw.first_air_date),
    date: raw.release_date ?? raw.first_air_date ?? null,
    overview: raw.overview ?? "",
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    voteAverage: typeof raw.vote_average === "number" ? Math.round(raw.vote_average * 10) / 10 : null,
  };
}

export async function searchTitles(query: string): Promise<TmdbTitle[]> {
  if (!query.trim()) return [];
  const data = await tmdb<{ results: RawResult[] }>("/search/multi", { query, include_adult: "false" });
  return data.results.map((r) => normalize(r)).filter((x): x is TmdbTitle => x !== null);
}

export async function trendingTitles(): Promise<TmdbTitle[]> {
  const data = await tmdb<{ results: RawResult[] }>("/trending/all/week");
  return data.results.map((r) => normalize(r)).filter((x): x is TmdbTitle => x !== null);
}

export async function nowPlayingMovies(): Promise<TmdbTitle[]> {
  const data = await tmdb<{ results: RawResult[] }>("/movie/now_playing", { region: "US" });
  return data.results.map((r) => normalize(r, "movie")).filter((x): x is TmdbTitle => x !== null);
}

export async function airingShows(): Promise<TmdbTitle[]> {
  const data = await tmdb<{ results: RawResult[] }>("/tv/on_the_air");
  return data.results.map((r) => normalize(r, "tv")).filter((x): x is TmdbTitle => x !== null);
}

/** Movies with a release date still ahead, soonest first. */
export async function upcomingMovies(): Promise<TmdbTitle[]> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await tmdb<RawPage>("/discover/movie", {
    "primary_release_date.gte": today,
    sort_by: "popularity.desc",
    "vote_count.gte": 0,
    region: "US",
    page: 1,
  });
  return data.results
    .map((r) => normalize(r, "movie"))
    .filter((x): x is TmdbTitle => x !== null && !!x.year && x.year >= new Date().getFullYear());
}

/** Highly rated films at least a decade old — the "worth revisiting" shelf. */
export async function classicFilms(): Promise<TmdbTitle[]> {
  const tenYearsAgo = `${new Date().getFullYear() - 10}-12-31`;
  const data = await tmdb<RawPage>("/discover/movie", {
    sort_by: "vote_average.desc",
    "vote_count.gte": 4000,
    "primary_release_date.lte": tenYearsAgo,
    page: 1,
  });
  return data.results.map((r) => normalize(r, "movie")).filter((x): x is TmdbTitle => x !== null);
}

// ---------------------------------------------------------------------------
// Browse: paginated feeds and genre filtering for the Library
// ---------------------------------------------------------------------------
export type BrowseFeed = "trending" | "popular" | "top_rated" | "now_playing" | "on_air";
export type MediaFilter = "all" | MediaType;

export interface GenreOption {
  name: string;
  movieId?: number;
  tvId?: number;
}

/** Curated genres with the TMDB ids for each side. Some are movie- or tv-only. */
export const GENRES: GenreOption[] = [
  { name: "Action", movieId: 28, tvId: 10759 },
  { name: "Comedy", movieId: 35, tvId: 35 },
  { name: "Drama", movieId: 18, tvId: 18 },
  { name: "Crime", movieId: 80, tvId: 80 },
  { name: "Thriller", movieId: 53 },
  { name: "Mystery", movieId: 9648, tvId: 9648 },
  { name: "Sci-Fi", movieId: 878, tvId: 10765 },
  { name: "Fantasy", movieId: 14, tvId: 10765 },
  { name: "Horror", movieId: 27 },
  { name: "Romance", movieId: 10749 },
  { name: "Adventure", movieId: 12, tvId: 10759 },
  { name: "Animation", movieId: 16, tvId: 16 },
  { name: "Documentary", movieId: 99, tvId: 99 },
  { name: "Family", movieId: 10751, tvId: 10751 },
  { name: "History", movieId: 36 },
  { name: "War", movieId: 10752, tvId: 10768 },
  { name: "Western", movieId: 37, tvId: 37 },
];

export interface BrowsePage {
  items: TmdbTitle[];
  page: number;
  totalPages: number;
}

export interface BrowseParams {
  feed: BrowseFeed;
  media: MediaFilter;
  movieGenre?: number;
  tvGenre?: number;
  page: number;
}

async function discover(
  media: MediaType,
  page: number,
  sortBy: string,
  genre: number | undefined,
  extra: Record<string, string | number>,
): Promise<RawPage> {
  const params: Record<string, string | number> = {
    page,
    sort_by: sortBy,
    include_adult: "false",
    ...extra,
  };
  if (genre !== undefined) params.with_genres = genre;
  return tmdb<RawPage>(`/discover/${media}`, params);
}

export async function browseTitles(p: BrowseParams): Promise<BrowsePage> {
  const { feed, media, movieGenre, tvGenre, page } = p;
  const genreActive = movieGenre !== undefined || tvGenre !== undefined;

  if (!genreActive && feed === "trending") {
    const d = await tmdb<RawPage>("/trending/all/week", { page });
    let items = d.results.map((r) => normalize(r)).filter((x): x is TmdbTitle => x !== null);
    if (media !== "all") items = items.filter((i) => i.mediaType === media);
    return { items, page: d.page, totalPages: Math.min(d.total_pages, 500) };
  }
  if (!genreActive && feed === "now_playing") {
    const d = await tmdb<RawPage>("/movie/now_playing", { page, region: "US" });
    return {
      items: d.results.map((r) => normalize(r, "movie")).filter((x): x is TmdbTitle => x !== null),
      page: d.page,
      totalPages: Math.min(d.total_pages, 500),
    };
  }
  if (!genreActive && feed === "on_air") {
    const d = await tmdb<RawPage>("/tv/on_the_air", { page });
    return {
      items: d.results.map((r) => normalize(r, "tv")).filter((x): x is TmdbTitle => x !== null),
      page: d.page,
      totalPages: Math.min(d.total_pages, 500),
    };
  }

  // discover-based: popular, top rated, or any genre filter
  const sortBy = feed === "top_rated" ? "vote_average.desc" : "popularity.desc";
  const extra: Record<string, string | number> = feed === "top_rated" ? { "vote_count.gte": 300 } : {};
  const sortKey: keyof RawResult = feed === "top_rated" ? "vote_average" : "popularity";

  const jobs: Promise<{ raw: RawPage; m: MediaType }>[] = [];
  if ((media === "all" || media === "movie") && (!genreActive || movieGenre !== undefined)) {
    jobs.push(discover("movie", page, sortBy, movieGenre, extra).then((raw) => ({ raw, m: "movie" as const })));
  }
  if ((media === "all" || media === "tv") && (!genreActive || tvGenre !== undefined)) {
    jobs.push(discover("tv", page, sortBy, tvGenre, extra).then((raw) => ({ raw, m: "tv" as const })));
  }
  if (jobs.length === 0) return { items: [], page, totalPages: 1 };

  const parts = await Promise.all(jobs);
  const merged = parts
    .flatMap((part) => part.raw.results.map((r) => ({ r, m: part.m })))
    .sort((a, b) => ((b.r[sortKey] as number) ?? 0) - ((a.r[sortKey] as number) ?? 0));
  const items = merged
    .map(({ r, m }) => normalize(r, m))
    .filter((x): x is TmdbTitle => x !== null);
  const totalPages = Math.min(...parts.map((part) => part.raw.total_pages), 500);
  return { items, page, totalPages };
}

interface RawDetail extends RawResult {
  runtime?: number;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  tagline?: string;
  external_ids?: { imdb_id?: string | null };
  imdb_id?: string | null;
  credits?: {
    cast?: { name: string; character?: string; profile_path?: string | null }[];
  };
  aggregate_credits?: {
    cast?: { name: string; roles?: { character?: string }[]; profile_path?: string | null }[];
  };
}

export async function titleDetail(mediaType: MediaType, tmdbId: number): Promise<TmdbDetail> {
  const append = mediaType === "movie" ? "credits,external_ids" : "aggregate_credits,external_ids";
  const raw = await tmdb<RawDetail>(`/${mediaType}/${tmdbId}`, { append_to_response: append });
  const base = normalize(raw, mediaType)!;

  const runtime =
    mediaType === "movie"
      ? raw.runtime ?? null
      : Array.isArray(raw.episode_run_time) && raw.episode_run_time.length
        ? raw.episode_run_time[0]
        : null;

  const castSource =
    mediaType === "movie"
      ? (raw.credits?.cast ?? []).map((c) => ({
          name: c.name,
          character: c.character ?? "",
          profilePath: c.profile_path ?? null,
        }))
      : (raw.aggregate_credits?.cast ?? []).map((c) => ({
          name: c.name,
          character: c.roles?.[0]?.character ?? "",
          profilePath: c.profile_path ?? null,
        }));

  return {
    ...base,
    runtime,
    genres: (raw.genres ?? []).map((g) => g.name),
    imdbId: raw.external_ids?.imdb_id ?? raw.imdb_id ?? null,
    tagline: raw.tagline?.trim() || null,
    cast: castSource.slice(0, 12),
  };
}
