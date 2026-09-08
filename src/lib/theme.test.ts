import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, getTheme, setTheme } from "./theme";

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to system when nothing is stored", () => {
    expect(getTheme()).toBe("system");
  });

  it("persists and reads back a choice", () => {
    setTheme("dark");
    expect(localStorage.getItem("stub-theme")).toBe("dark");
    expect(getTheme()).toBe("dark");
  });

  it("stamps data-theme for light and dark, clears it for system", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    applyTheme("system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("ignores an unrecognised stored value", () => {
    localStorage.setItem("stub-theme", "sepia");
    expect(getTheme()).toBe("system");
  });

  it("falls back to system when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getTheme()).toBe("system");
  });
});
