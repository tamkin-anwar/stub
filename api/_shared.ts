// Shared helpers for the /api proxy functions. Underscore prefix so Vercel
// does not treat this as a route.

export interface OmdbScores {
  imdb: number | null;
  imdbVotes: number | null;
  rt: number | null;
  metacritic: number | null;
}
export const EMPTY_SCORES: OmdbScores = { imdb: null, imdbVotes: null, rt: null, metacritic: null };

export interface Article {
  id: string;
  title: string;
  url: string;
  published: string;
  section: string;
  trail: string | null;
  thumbnail: string | null;
  byline: string | null;
}

const num = (s?: string | null): number | null => {
  if (!s) return null;
  const n = Number.parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

interface OmdbRaw {
  Response?: string;
  imdbRating?: string;
  imdbVotes?: string;
  Metascore?: string;
  Ratings?: { Source: string; Value: string }[];
}

export function normalizeOmdb(data: OmdbRaw): OmdbScores {
  if (data.Response === "False") return EMPTY_SCORES;
  const from = (source: string) => data.Ratings?.find((r) => r.Source === source)?.Value ?? null;
  const rtRaw = from("Rotten Tomatoes");
  const mcRaw = from("Metacritic") ?? (data.Metascore ? `${data.Metascore}/100` : null);
  return {
    imdb: num(data.imdbRating),
    imdbVotes: num(data.imdbVotes),
    rt: rtRaw ? num(rtRaw) : null,
    metacritic: mcRaw ? num(mcRaw) : null,
  };
}

const stripTags = (html?: string) => (html ?? "").replace(/<[^>]+>/g, "").trim();

interface GuardianRaw {
  response?: {
    results?: {
      id: string;
      webTitle: string;
      webUrl: string;
      webPublicationDate: string;
      sectionName: string;
      fields?: { trailText?: string; thumbnail?: string; byline?: string };
    }[];
  };
}

export function mapGuardian(data: GuardianRaw): Article[] {
  return (data.response?.results ?? []).map((r) => ({
    id: r.id,
    title: r.webTitle,
    url: r.webUrl,
    published: r.webPublicationDate,
    section: r.sectionName,
    trail: stripTags(r.fields?.trailText) || null,
    thumbnail: r.fields?.thumbnail || null,
    byline: r.fields?.byline || null,
  }));
}

/** JSON response with a CDN cache header. `sMaxage` seconds shared-cache fresh,
 *  then served stale while revalidating for the same again. */
export function json(data: unknown, sMaxage: number, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=0, s-maxage=${sMaxage}, stale-while-revalidate=${sMaxage}`,
    },
  });
}
