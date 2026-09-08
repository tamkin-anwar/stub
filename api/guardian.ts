import { json, mapGuardian } from "./_shared";

export const config = { runtime: "edge" };

const KEY = process.env.GUARDIAN_API_KEY;
const HALF_HOUR = 60 * 30;

export default async function handler(req: Request): Promise<Response> {
  const raw = Number(new URL(req.url).searchParams.get("limit"));
  const limit = Math.min(24, Math.max(1, Number.isFinite(raw) && raw > 0 ? raw : 12));
  if (!KEY) return json({ articles: [] }, HALF_HOUR);

  try {
    const qs = new URLSearchParams({
      section: "film|tv-and-radio",
      "order-by": "newest",
      "show-fields": "trailText,thumbnail,byline",
      "page-size": String(limit),
      "api-key": KEY,
    });
    const r = await fetch(`https://content.guardianapis.com/search?${qs}`);
    if (!r.ok) return json({ articles: [] }, 300);
    return json({ articles: mapGuardian(await r.json()) }, HALF_HOUR);
  } catch {
    return json({ articles: [] }, 60);
  }
}
