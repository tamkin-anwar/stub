import { afterEach, describe, expect, it, vi } from "vitest";
import { posterUrl, backdropUrl, searchTitles, titleDetail, upcomingMovies } from "./tmdb";

function stubRegion(language: string) {
  const original = Object.getOwnPropertyDescriptor(window.navigator, "language");
  Object.defineProperty(window.navigator, "language", { value: language, configurable: true });
  return () => {
    if (original) Object.defineProperty(window.navigator, "language", original);
  };
}

function mockFetch(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(""),
  });
}

describe("image url helpers", () => {
  it("build a full url or return null", () => {
    expect(posterUrl("/abc.jpg")).toBe("https://image.tmdb.org/t/p/w342/abc.jpg");
    expect(posterUrl("/abc.jpg", "w500")).toBe("https://image.tmdb.org/t/p/w500/abc.jpg");
    expect(posterUrl(null)).toBeNull();
    expect(backdropUrl(null)).toBeNull();
  });
});

describe("searchTitles", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not hit the network for a blank query", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await searchTitles("   ")).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("routes through /api/tmdb, normalises rows and drops people", async () => {
    const spy = mockFetch({
      results: [
        { id: 1, media_type: "movie", title: "A Film", release_date: "2020-05-01", vote_average: 7.234 },
        { id: 2, media_type: "tv", name: "A Show", first_air_date: "2019-01-01", vote_average: 8 },
        { id: 3, media_type: "person", name: "An Actor" },
      ],
    });
    vi.stubGlobal("fetch", spy);
    const out = await searchTitles("a");
    const url = spy.mock.calls[0][0] as string;
    expect(url).toMatch(/^\/api\/tmdb\?/);
    expect(decodeURIComponent(url)).toContain("path=/search/multi");
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ tmdbId: 1, mediaType: "movie", name: "A Film", year: 2020, voteAverage: 7.2 });
    expect(out[1]).toMatchObject({ tmdbId: 2, mediaType: "tv", name: "A Show", year: 2019 });
  });
});

describe("upcomingMovies", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps only titles dated this year or later", async () => {
    const thisYear = new Date().getFullYear();
    vi.stubGlobal(
      "fetch",
      mockFetch({
        page: 1,
        total_pages: 1,
        results: [
          { id: 10, title: "Next Year", release_date: `${thisYear + 1}-03-01` },
          { id: 11, title: "This Year", release_date: `${thisYear}-12-20` },
          { id: 12, title: "Undated", release_date: "" },
          { id: 13, title: "Old", release_date: "1999-01-01" },
        ],
      }),
    );
    const out = await upcomingMovies();
    expect(out.map((t) => t.tmdbId).sort()).toEqual([10, 11]);
    expect(out.every((t) => t.mediaType === "movie")).toBe(true);
  });
});

describe("titleDetail watch providers", () => {
  afterEach(() => vi.unstubAllGlobals());

  const rawWithProviders = (byRegion: Record<string, unknown>) => ({
    id: 603,
    title: "The Matrix",
    "watch/providers": { results: byRegion },
  });

  it("uses only the viewer's own region, never blending in another's", async () => {
    const restore = stubRegion("en-GB");
    vi.stubGlobal(
      "fetch",
      mockFetch(
        rawWithProviders({
          US: { flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/n.jpg" }] },
          GB: { flatrate: [{ provider_id: 9, provider_name: "NOW", logo_path: "/g.jpg" }] },
        }),
      ),
    );
    const d = await titleDetail("movie", 603);
    expect(d.watchProviders?.region).toBe("GB");
    expect(d.watchProviders?.flatrate).toEqual([{ id: 9, name: "NOW", logoPath: "/g.jpg" }]);
    restore();
  });

  it("falls back to US when the viewer's own region has no data", async () => {
    const restore = stubRegion("en-DE");
    vi.stubGlobal(
      "fetch",
      mockFetch(
        rawWithProviders({
          US: { flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/n.jpg" }] },
        }),
      ),
    );
    const d = await titleDetail("movie", 603);
    expect(d.watchProviders?.region).toBe("US");
    expect(d.watchProviders?.flatrate[0].name).toBe("Netflix");
    restore();
  });

  it("returns null rather than guess when no region has data", async () => {
    const restore = stubRegion("en-US");
    vi.stubGlobal("fetch", mockFetch({ id: 603, title: "The Matrix" }));
    const d = await titleDetail("movie", 603);
    expect(d.watchProviders).toBeNull();
    restore();
  });

  it("sorts providers by display priority", async () => {
    const restore = stubRegion("en-US");
    vi.stubGlobal(
      "fetch",
      mockFetch(
        rawWithProviders({
          US: {
            rent: [
              { provider_id: 2, provider_name: "Second", logo_path: null, display_priority: 2 },
              { provider_id: 1, provider_name: "First", logo_path: null, display_priority: 1 },
            ],
          },
        }),
      ),
    );
    const d = await titleDetail("movie", 603);
    expect(d.watchProviders?.rent.map((p) => p.name)).toEqual(["First", "Second"]);
    restore();
  });
});

describe("titleDetail trailer", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("prefers an official English YouTube trailer over other videos", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        id: 603,
        title: "The Matrix",
        videos: {
          results: [
            { key: "clip1", site: "YouTube", type: "Clip", official: true, iso_639_1: "en" },
            { key: "fr-trailer", site: "YouTube", type: "Trailer", official: false, iso_639_1: "fr" },
            { key: "official-en", site: "YouTube", type: "Trailer", official: true, iso_639_1: "en" },
          ],
        },
      }),
    );
    const d = await titleDetail("movie", 603);
    expect(d.trailerKey).toBe("official-en");
  });

  it("is null when there is no YouTube trailer", async () => {
    vi.stubGlobal("fetch", mockFetch({ id: 603, title: "The Matrix", videos: { results: [] } }));
    const d = await titleDetail("movie", 603);
    expect(d.trailerKey).toBeNull();
  });
});

describe("titleDetail recommendations", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("normalises recommended titles, forcing the parent's media type since TMDB's per-type recommendations endpoint omits it", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        id: 603,
        title: "The Matrix",
        recommendations: {
          page: 1,
          total_pages: 1,
          results: [{ id: 604, title: "The Matrix Reloaded", release_date: "2003-05-15" }],
        },
      }),
    );
    const d = await titleDetail("movie", 603);
    expect(d.recommendations).toHaveLength(1);
    expect(d.recommendations[0]).toMatchObject({ tmdbId: 604, mediaType: "movie", year: 2003 });
  });
});
