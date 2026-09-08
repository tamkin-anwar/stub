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

/**
 * Recent film and TV coverage from The Guardian, via /api/guardian. The
 * function holds the key and caches the feed for ~30 minutes on the CDN, so
 * the developer key's 500/day limit is nowhere near a concern.
 */
export async function guardianArticles(limit = 12): Promise<Article[]> {
  try {
    const res = await fetch(`/api/guardian?limit=${limit}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { articles?: Article[] };
    return data.articles ?? [];
  } catch {
    return [];
  }
}
