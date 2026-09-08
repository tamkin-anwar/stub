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
}

function normalize(raw: RawResult, forced?: MediaType): TmdbTitle | null {
  const mediaType = (forced ?? raw.media_type) as MediaType | undefined;
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  return {
    tmdbId: raw.id,
    mediaType,
    name: raw.title ?? raw.name ?? raw.original_title ?? raw.original_name ?? "Untitled",
    year: yearOf(raw.release_date ?? raw.first_air_date),
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
