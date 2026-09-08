import { afterEach, describe, expect, it, vi } from "vitest";
import { omdbScores } from "./omdb";

const EMPTY = { imdb: null, imdbVotes: null, rt: null, metacritic: null };

function mockFetch(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(body) });
}

describe("omdbScores", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns empty and skips the network without an imdb id", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await omdbScores(null)).toEqual(EMPTY);
    expect(await omdbScores("")).toEqual(EMPTY);
    expect(spy).not.toHaveBeenCalled();
  });

  it("calls the proxy and returns its already-normalised JSON", async () => {
    const spy = mockFetch({ imdb: 8.6, imdbVotes: 2145890, rt: 94, metacritic: 74 });
    vi.stubGlobal("fetch", spy);
    expect(await omdbScores("tt0816692")).toEqual({
      imdb: 8.6,
      imdbVotes: 2145890,
      rt: 94,
      metacritic: 74,
    });
    expect(spy.mock.calls[0][0]).toBe("/api/omdb?i=tt0816692");
  });

  it("returns empty on an HTTP error", async () => {
    vi.stubGlobal("fetch", mockFetch({}, false));
    expect(await omdbScores("tt1")).toEqual(EMPTY);
  });

  it("returns empty when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await omdbScores("tt1")).toEqual(EMPTY);
  });
});
