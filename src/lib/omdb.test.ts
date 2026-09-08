import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./env", () => ({
  env: { omdbKey: "testkey" },
  omdbReady: true,
}));

import { omdbScores } from "./omdb";

const EMPTY = { imdb: null, imdbVotes: null, rt: null, metacritic: null };

function mockFetch(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

describe("omdbScores", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch({}));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns empty without an imdb id and never calls the network", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await omdbScores(null)).toEqual(EMPTY);
    expect(await omdbScores(undefined)).toEqual(EMPTY);
    expect(await omdbScores("")).toEqual(EMPTY);
    expect(spy).not.toHaveBeenCalled();
  });

  it("parses IMDb, Rotten Tomatoes and Metacritic from a full response", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
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
    );
    expect(await omdbScores("tt0816692")).toEqual({
      imdb: 8.6,
      imdbVotes: 2145890,
      rt: 94,
      metacritic: 74,
    });
  });

  it("falls back to Metascore when Metacritic is absent from Ratings", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        Response: "True",
        imdbRating: "7.1",
        imdbVotes: "10,000",
        Metascore: "61",
        Ratings: [{ Source: "Rotten Tomatoes", Value: "80%" }],
      }),
    );
    const s = await omdbScores("tt1");
    expect(s.metacritic).toBe(61);
    expect(s.rt).toBe(80);
  });

  it("returns empty on a not-found response", async () => {
    vi.stubGlobal("fetch", mockFetch({ Response: "False", Error: "Incorrect IMDb ID." }));
    expect(await omdbScores("tt-bogus")).toEqual(EMPTY);
  });

  it("returns empty on an HTTP error", async () => {
    vi.stubGlobal("fetch", mockFetch({}, false));
    expect(await omdbScores("tt1")).toEqual(EMPTY);
  });

  it("leaves RT and Metacritic null for a title that has neither (typical for TV)", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        Response: "True",
        imdbRating: "9.0",
        imdbVotes: "500,000",
        Metascore: "N/A",
        Ratings: [{ Source: "Internet Movie Database", Value: "9.0/10" }],
      }),
    );
    const s = await omdbScores("tt2");
    expect(s.imdb).toBe(9);
    expect(s.rt).toBeNull();
    expect(s.metacritic).toBeNull();
  });
});
