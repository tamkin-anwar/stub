// Browsers word a failed network request differently (Chrome "Failed to fetch",
// Safari "Load failed", Firefox "NetworkError when attempting to fetch resource"),
// and supabase-js passes that raw text through. None of it means anything to a user.
const NETWORK_ERROR = /failed to fetch|load failed|networkerror|network request failed/i;

export function authErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  const message = err instanceof Error ? err.message : "";
  if (NETWORK_ERROR.test(message)) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return "You're offline. Check your connection and try again.";
    }
    return "Stub can't reach its server right now. Please try again in a few minutes.";
  }
  return message || fallback;
}
