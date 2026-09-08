import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./env", () => ({
  env: { guardianKey: "testkey" },
  guardianReady: true,
}));

import { guardianArticles } from "./guardian";

function mockFetch(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(body) });
}

const payload = {
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

describe("guardianArticles", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps the Guardian shape and strips HTML from the trail", async () => {
    vi.stubGlobal("fetch", mockFetch(payload));
    const out = await guardianArticles(2);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({
      id: "film/2026/sep/08/some-review",
      title: "Some Review",
      url: "https://www.theguardian.com/film/2026/sep/08/some-review",
      section: "Film",
      trail: "A bold take on everything",
      thumbnail: "https://media.guim.co.uk/abc/500.jpg",
      byline: "A Critic",
    });
  });

  it("uses null for missing trail, thumbnail and byline", async () => {
    vi.stubGlobal("fetch", mockFetch(payload));
    const out = await guardianArticles(2);
    expect(out[1].trail).toBeNull();
    expect(out[1].thumbnail).toBeNull();
    expect(out[1].byline).toBeNull();
  });

  it("requests the film and TV sections", async () => {
    const spy = mockFetch(payload);
    vi.stubGlobal("fetch", spy);
    await guardianArticles(5);
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("content.guardianapis.com/search");
    expect(decodeURIComponent(url)).toContain("section=film|tv-and-radio");
    expect(url).toContain("page-size=5");
  });

  it("returns an empty list on an HTTP error", async () => {
    vi.stubGlobal("fetch", mockFetch({}, false));
    expect(await guardianArticles()).toEqual([]);
  });
});
