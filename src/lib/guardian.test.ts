import { afterEach, describe, expect, it, vi } from "vitest";
import { guardianArticles } from "./guardian";

function mockFetch(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(body) });
}

const articles = [
  { id: "film/x", title: "X", url: "u", published: "p", section: "Film", trail: null, thumbnail: null, byline: null },
];

describe("guardianArticles", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("calls the proxy with the limit and returns its articles array", async () => {
    const spy = mockFetch({ articles });
    vi.stubGlobal("fetch", spy);
    expect(await guardianArticles(8)).toEqual(articles);
    expect(spy.mock.calls[0][0]).toBe("/api/guardian?limit=8");
  });

  it("returns an empty list on an HTTP error", async () => {
    vi.stubGlobal("fetch", mockFetch({}, false));
    expect(await guardianArticles()).toEqual([]);
  });

  it("returns an empty list when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await guardianArticles()).toEqual([]);
  });
});
