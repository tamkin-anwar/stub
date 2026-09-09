// Shared helpers for the /api proxy functions. Underscore prefix so Vercel
// does not treat this as a route.

/** Read a server env var. The Vercel project uses the unprefixed names
 *  (TMDB_ACCESS_TOKEN and so on); the VITE_-prefixed fallback is kept only so a
 *  clone with an older .env still runs. */
export function serverKey(name: string): string | undefined {
  return process.env[name] || process.env[`VITE_${name}`];
}

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

/** Validate a TMDB poster path and turn it into a Storage object key.
 *  Returns null for anything that is not a plain "/hash.ext" image path. */
const POSTER_PATH = /^\/[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/;
export function posterObjectKey(path: string): string | null {
  if (path.includes("..") || !POSTER_PATH.test(path)) return null;
  return `w342${path}`;
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

/** Cache headers: browsers don't store it, but Vercel's edge holds it for
 *  `sMaxage` seconds and serves it stale for the same again while it
 *  revalidates. CDN-Cache-Control is set explicitly so Vercel doesn't
 *  normalise the plain Cache-Control away. */
export function cacheHeaders(sMaxage: number): Record<string, string> {
  const shared = `public, s-maxage=${sMaxage}, stale-while-revalidate=${sMaxage}`;
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=0, must-revalidate",
    "cdn-cache-control": shared,
    "vercel-cdn-cache-control": shared,
  };
}

export function json(data: unknown, sMaxage: number, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: cacheHeaders(sMaxage) });
}

/**
 * Best-effort per-IP rate limit. The counter lives in the edge instance's
 * memory, so it is not shared across regions or instances: it blunts a single
 * client hammering one function, not distributed abuse. Set the ceilings well
 * above any real session so only a script trips them. For hard guarantees,
 * enable rate limiting in the Vercel firewall.
 */
const HITS = new Map<string, { n: number; reset: number }>();

export function rateLimit(
  req: Request,
  bucket: string,
  limit: number,
  windowMs = 60_000,
): Response | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();

  if (HITS.size > 5000) {
    for (const [k, v] of HITS) if (v.reset < now) HITS.delete(k);
  }

  const cur = HITS.get(key);
  if (!cur || cur.reset < now) {
    HITS.set(key, { n: 1, reset: now + windowMs });
    return null;
  }
  cur.n += 1;
  if (cur.n > limit) {
    const retry = Math.max(1, Math.ceil((cur.reset - now) / 1000));
    return new Response(JSON.stringify({ error: "rate limited" }), {
      status: 429,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "retry-after": String(retry),
        "cache-control": "no-store",
      },
    });
  }
  return null;
}
