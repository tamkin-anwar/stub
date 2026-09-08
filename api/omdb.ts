import { EMPTY_SCORES, json, normalizeOmdb, serverKey } from "./_shared";

export const config = { runtime: "edge" };

const KEY = serverKey("OMDB_API_KEY");
const WEEK = 60 * 60 * 24 * 7;

export default async function handler(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("i");
  if (!id || !/^tt\d+$/.test(id)) return json({ error: "invalid imdb id" }, 60, 400);
  if (!KEY) return json(EMPTY_SCORES, 3600);

  try {
    const r = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${encodeURIComponent(id)}`);
    if (!r.ok) return json(EMPTY_SCORES, 300);
    const data = await r.json();
    // Cache a "nothing found" result for a day, real scores for a week.
    return json(normalizeOmdb(data), data.Response === "False" ? 60 * 60 * 24 : WEEK);
  } catch {
    return json(EMPTY_SCORES, 60);
  }
}
