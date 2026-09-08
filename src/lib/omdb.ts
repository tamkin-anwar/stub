import { env, omdbReady } from "./env";

export interface OmdbScores {
  imdb: number | null;
  imdbVotes: number | null;
  rt: number | null; // Rotten Tomatoes critics, percent
  metacritic: number | null;
}

const EMPTY: OmdbScores = { imdb: null, imdbVotes: null, rt: null, metacritic: null };

interface OmdbRaw {
  Response?: string;
  imdbRating?: string;
  imdbVotes?: string;
  Metascore?: string;
  Ratings?: { Source: string; Value: string }[];
}

/**
 * Fetch IMDb, Rotten Tomatoes, and Metacritic scores for one title by its
 * IMDb id. OMDb has no official RT feed of its own; this is the practical
 * route to those numbers. Returns all-null when OMDb is not configured.
 */
export async function omdbScores(imdbId: string | null | undefined): Promise<OmdbScores> {
  if (!imdbId || !omdbReady) return EMPTY;
  const url = `https://www.omdbapi.com/?apikey=${env.omdbKey}&i=${encodeURIComponent(imdbId)}`;
  const res = await fetch(url);
  if (!res.ok) return EMPTY;
  const data = (await res.json()) as OmdbRaw;
  if (data.Response === "False") return EMPTY;

  const num = (s?: string) => {
    const n = Number.parseFloat((s ?? "").replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  const fromRatings = (source: string) =>
    data.Ratings?.find((r) => r.Source === source)?.Value ?? null;

  const rtRaw = fromRatings("Rotten Tomatoes"); // "94%"
  const mcRaw = fromRatings("Metacritic") ?? (data.Metascore ? `${data.Metascore}/100` : null);

  return {
    imdb: num(data.imdbRating),
    imdbVotes: num(data.imdbVotes),
    rt: rtRaw ? num(rtRaw) : null,
    metacritic: mcRaw ? num(mcRaw) : null,
  };
}
