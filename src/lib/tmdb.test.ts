import { afterEach, describe, expect, it, vi } from "vitest";
import { posterUrl, backdropUrl, searchTitles, upcomingMovies } from "./tmdb";

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
