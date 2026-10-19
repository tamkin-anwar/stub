import { afterEach, describe, expect, it, vi } from "vitest";
import { authErrorMessage } from "./authError";

describe("authErrorMessage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each(["Failed to fetch", "Load failed", "NetworkError when attempting to fetch resource."])(
    "replaces the browser's network error %j",
    (raw) => {
      expect(authErrorMessage(new TypeError(raw))).toMatch(/can't reach its server/);
    },
  );

  it("says offline when the device has no connection", () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect(authErrorMessage(new TypeError("Failed to fetch"))).toMatch(/offline/);
  });

  it("keeps real auth errors as they are", () => {
    expect(authErrorMessage(new Error("Invalid login credentials"))).toBe(
      "Invalid login credentials",
    );
  });

  it("falls back for non-errors", () => {
    expect(authErrorMessage("nope", "Could not resend the email.")).toBe(
      "Could not resend the email.",
    );
  });
});
