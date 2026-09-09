import { env } from "./env";

/**
 * Cached poster art. When VITE_POSTER_CACHE is on, cards point at a copy of
 * the poster held in Supabase Storage instead of TMDB's CDN, and ask the
 * server to make that copy the first time a poster is seen. Off by default,
 * so the app falls back to TMDB URLs with no behaviour change.
 */

const ENABLED = import.meta.env.VITE_POSTER_CACHE === "1" && !!env.supabaseUrl;
const PUBLIC = `${env.supabaseUrl}/storage/v1/object/public/posters`;
const asked = new Set<string>();

/** Storage URL for a TMDB poster path. Null when the feature is off. May 404
 *  until the copy exists, so callers should fall back to the TMDB URL. */
export function storedPosterUrl(path: string | null): string | null {
  if (!ENABLED || !path) return null;
  return `${PUBLIC}/w342${path}`;
}

/** Ask the server to copy a poster into Storage. Fire and forget, at most
 *  once per path per session. */
export function cachePoster(path: string | null): void {
  if (!ENABLED || !path || asked.has(path)) return;
  asked.add(path);
  void fetch(`/api/poster?path=${encodeURIComponent(path)}`).catch(() => {});
}
