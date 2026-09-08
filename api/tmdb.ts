export const config = { runtime: "edge" };

const TOKEN = process.env.TMDB_ACCESS_TOKEN;

// Only the read-only endpoints the app actually uses.
const ALLOW: RegExp[] = [
  /^\/trending\/(all|movie|tv)\/(day|week)$/,
  /^\/search\/(multi|movie|tv)$/,
  /^\/discover\/(movie|tv)$/,
  /^\/movie\/now_playing$/,
  /^\/tv\/on_the_air$/,
  /^\/(movie|tv)\/\d+$/,
  /^\/(movie|tv)\/\d+\/external_ids$/,
];

export default async function handler(req: Request): Promise<Response> {
  const u = new URL(req.url);
  const path = u.searchParams.get("path") ?? "";

  if (!TOKEN) {
    return new Response(JSON.stringify({ error: "tmdb not configured" }), {
      status: 503,
      headers: { "content-type": "application/json", "cache-control": "public, s-maxage=60" },
    });
  }
  if (!path.startsWith("/") || path.includes("..") || !ALLOW.some((re) => re.test(path))) {
    return new Response(JSON.stringify({ error: "path not allowed" }), {
      status: 400,
      headers: { "content-type": "application/json", "cache-control": "public, s-maxage=300" },
    });
  }

  const params = new URLSearchParams(u.search);
  params.delete("path");
  params.set("language", "en-US");

  try {
    const r = await fetch(`https://api.themoviedb.org/3${path}?${params}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, accept: "application/json" },
    });
    const body = await r.text();
    // Title detail rarely changes; discovery feeds move through the day.
    const ttl = /^\/(movie|tv)\/\d+$/.test(path) ? 60 * 60 * 24 : 60 * 15;
    return new Response(body, {
      status: r.status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": r.ok
          ? `public, max-age=0, s-maxage=${ttl}, stale-while-revalidate=${ttl}`
          : "public, s-maxage=30",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "tmdb unreachable" }), {
      status: 502,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
}
