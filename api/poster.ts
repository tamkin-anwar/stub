import { json, posterObjectKey, serverKey } from "./_shared";

export const config = { runtime: "edge" };

const BASE = serverKey("SUPABASE_URL");
const SERVICE = serverKey("SUPABASE_SERVICE_ROLE_KEY");
const WEEK = 60 * 60 * 24 * 7;
const HOUR = 60 * 60;

/**
 * Copy a TMDB poster into the public `posters` Storage bucket once, then hand
 * back its Supabase URL. Keeps the grid off TMDB's CDN after the first sight
 * of a title. Called fire-and-forget by the client; it degrades to a null URL
 * (client keeps the TMDB image) when Storage is not configured.
 */
export default async function handler(req: Request): Promise<Response> {
  const path = new URL(req.url).searchParams.get("path") ?? "";
  const key = posterObjectKey(path);
  if (!key) return json({ url: null, error: "bad path" }, HOUR, 400);
  if (!BASE || !SERVICE) return json({ url: null }, HOUR);

  const publicUrl = `${BASE}/storage/v1/object/public/posters/${key}`;

  try {
    const head = await fetch(publicUrl, { method: "HEAD" });
    if (head.ok) return json({ url: publicUrl, cached: true }, WEEK);

    const src = await fetch(`https://image.tmdb.org/t/p/w342${path}`);
    if (!src.ok) return json({ url: null }, HOUR);
    const bytes = await src.arrayBuffer();
    const contentType = src.headers.get("content-type") || "image/jpeg";

    const put = await fetch(`${BASE}/storage/v1/object/posters/${key}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${SERVICE}`,
        "content-type": contentType,
        "cache-control": "31536000",
        "x-upsert": "true",
      },
      body: bytes,
    });
    if (!put.ok && put.status !== 409) {
      return json({ url: null, error: `upload ${put.status}` }, HOUR);
    }
    return json({ url: publicUrl, cached: false }, WEEK);
  } catch {
    return json({ url: null, error: "unreachable" }, HOUR);
  }
}
