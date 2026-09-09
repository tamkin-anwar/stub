import { describe, expect, it } from "vitest";
import { json, mapGuardian, normalizeOmdb, posterObjectKey } from "./_shared";

describe("normalizeOmdb", () => {
  it("parses IMDb, Rotten Tomatoes and Metacritic from a full response", () => {
    expect(
      normalizeOmdb({
        Response: "True",
        imdbRating: "8.6",
        imdbVotes: "2,145,890",
        Metascore: "74",
        Ratings: [
          { Source: "Internet Movie Database", Value: "8.6/10" },
          { Source: "Rotten Tomatoes", Value: "94%" },
          { Source: "Metacritic", Value: "74/100" },
        ],
      }),
    ).toEqual({ imdb: 8.6, imdbVotes: 2145890, rt: 94, metacritic: 74 });
  });

  it("falls back to Metascore when Metacritic is absent from Ratings", () => {
    const s = normalizeOmdb({
      Response: "True",
      imdbRating: "7.1",
      imdbVotes: "10,000",
      Metascore: "61",
      Ratings: [{ Source: "Rotten Tomatoes", Value: "80%" }],
    });
    expect(s.metacritic).toBe(61);
    expect(s.rt).toBe(80);
  });

  it("is all-null for a not-found response", () => {
    expect(normalizeOmdb({ Response: "False" })).toEqual({
      imdb: null,
      imdbVotes: null,
      rt: null,
      metacritic: null,
    });
  });

  it("leaves RT and Metacritic null when a title has neither (typical for TV)", () => {
    const s = normalizeOmdb({
      Response: "True",
      imdbRating: "9.0",
      imdbVotes: "500,000",
      Metascore: "N/A",
      Ratings: [{ Source: "Internet Movie Database", Value: "9.0/10" }],
    });
    expect(s).toEqual({ imdb: 9, imdbVotes: 500000, rt: null, metacritic: null });
  });
});

describe("mapGuardian", () => {
  const raw = {
    response: {
      results: [
        {
          id: "film/2026/sep/08/some-review",
          webTitle: "Some Review",
          webUrl: "https://www.theguardian.com/film/2026/sep/08/some-review",
          webPublicationDate: "2026-09-08T06:00:00Z",
          sectionName: "Film",
          fields: {
            trailText: "A <strong>bold</strong> take on <em>everything</em>",
            thumbnail: "https://media.guim.co.uk/abc/500.jpg",
            byline: "A Critic",
          },
        },
        {
          id: "tv-and-radio/2026/sep/07/no-fields",
          webTitle: "No Fields",
          webUrl: "https://www.theguardian.com/tv-and-radio/2026/sep/07/no-fields",
          webPublicationDate: "2026-09-07T06:00:00Z",
          sectionName: "Television & radio",
        },
      ],
    },
  };

  it("maps the shape and strips HTML from the trail", () => {
    const [a, b] = mapGuardian(raw);
    expect(a).toMatchObject({
      id: "film/2026/sep/08/some-review",
      title: "Some Review",
      section: "Film",
      trail: "A bold take on everything",
      byline: "A Critic",
    });
    expect(b.trail).toBeNull();
    expect(b.thumbnail).toBeNull();
    expect(b.byline).toBeNull();
  });

  it("is an empty array with no results", () => {
    expect(mapGuardian({})).toEqual([]);
  });
});

describe("posterObjectKey", () => {
  it("prefixes a valid TMDB poster path with the size", () => {
    expect(posterObjectKey("/aBc123-x.jpg")).toBe("w342/aBc123-x.jpg");
    expect(posterObjectKey("/p.png")).toBe("w342/p.png");
    expect(posterObjectKey("/p.webp")).toBe("w342/p.webp");
  });

  it("rejects anything that is not a plain image path", () => {
    expect(posterObjectKey("")).toBeNull();
    expect(posterObjectKey("aBc.jpg")).toBeNull();
    expect(posterObjectKey("/../secret.jpg")).toBeNull();
    expect(posterObjectKey("/a/b.jpg")).toBeNull();
    expect(posterObjectKey("/a.jpg?x=1")).toBeNull();
    expect(posterObjectKey("/a.gif")).toBeNull();
  });
});

describe("json", () => {
  it("sets a shared-cache header and serialises the body", async () => {
    const r = json({ ok: true }, 900);
    expect(r.status).toBe(200);
    expect(r.headers.get("cdn-cache-control")).toContain("s-maxage=900");
    expect(r.headers.get("cache-control")).toContain("max-age=0");
    expect(await r.json()).toEqual({ ok: true });
  });
});
