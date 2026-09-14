import { afterEach, describe, expect, it, vi } from "vitest";
import { pickRandom, randomPage } from "./random";

describe("pickRandom", () => {
  afterEach(() => vi.restoreAllMocks());

  it("is undefined for an empty array", () => {
    expect(pickRandom([])).toBeUndefined();
  });

  it("is the only element for a single-item array", () => {
    expect(pickRandom(["x"])).toBe("x");
  });

  it("picks the index Math.random maps to", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(pickRandom(["a", "b", "c", "d"])).toBe("c");
  });
});

describe("randomPage", () => {
  afterEach(() => vi.restoreAllMocks());

  it("stays within 1..max", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(randomPage(20)).toBe(1);
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    expect(randomPage(20)).toBe(20);
  });

  it("treats max < 1 as 1", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(randomPage(0)).toBe(1);
  });
});
