import { env, guardianReady } from "./env";

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

/**
 * Recent film and TV coverage from The Guardian's Open Platform. Free,
 * CORS-friendly, generous limits. Returns [] when no key is configured.
 */
export async function guardianArticles(limit = 12): Promise<Article[]> {
  if (!guardianReady) return [];
  const qs = new URLSearchParams({
    section: "film|tv-and-radio",
    "order-by": "newest",
    "show-fields": "trailText,thumbnail,byline",
    "page-size": String(limit),
    "api-key": env.guardianKey,
  });
  const res = await fetch(`https://content.guardianapis.com/search?${qs}`);
  if (!res.ok) return [];
  const data = (await res.json()) as GuardianRaw;
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

function stripTags(html?: string): string {
  return (html ?? "").replace(/<[^>]+>/g, "").trim();
}
