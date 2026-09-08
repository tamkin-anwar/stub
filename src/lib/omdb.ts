export interface OmdbScores {
  imdb: number | null;
  imdbVotes: number | null;
  rt: number | null; // Rotten Tomatoes critics, percent
  metacritic: number | null;
}

const EMPTY: OmdbScores = { imdb: null, imdbVotes: null, rt: null, metacritic: null };

/**
 * IMDb, Rotten Tomatoes and Metacritic scores for one title by its IMDb id.
 * Goes through /api/omdb, which holds the OMDb key server-side and caches
 * results on the CDN so the 1,000/day free quota is shared, not per-visit.
 */
export async function omdbScores(imdbId: string | null | undefined): Promise<OmdbScores> {
  if (!imdbId) return EMPTY;
  try {
    const res = await fetch(`/api/omdb?i=${encodeURIComponent(imdbId)}`);
    if (!res.ok) return EMPTY;
    return (await res.json()) as OmdbScores;
  } catch {
    return EMPTY;
  }
}
