import { describe, expect, it } from "vitest";
import { parseDsn } from "./monitoring";

describe("parseDsn", () => {
  it("splits a standard Sentry DSN into a store endpoint and key", () => {
    expect(parseDsn("https://abc123@o42.ingest.sentry.io/456")).toEqual({
      key: "abc123",
      url: "https://o42.ingest.sentry.io/api/456/store/",
    });
  });

  it("returns null when the public key or project id is missing", () => {
    expect(parseDsn("https://o42.ingest.sentry.io/456")).toBeNull();
    expect(parseDsn("https://abc123@o42.ingest.sentry.io/")).toBeNull();
    expect(parseDsn("not a url")).toBeNull();
  });
});
