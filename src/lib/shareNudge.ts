// A one-time hint that a shared list exists, dismissed for good once acted
// on or closed. Device-local like the theme preference: not worth a column.
// Keyed per account, not one flat key — otherwise a second person signing
// into the same browser inherits the first account's dismissal and never
// sees the hint at all, even with zero friends of their own.

const PREFIX = "stub-dismissed-share-nudge:";

export function isShareNudgeDismissed(userId: string): boolean {
  try {
    return localStorage.getItem(PREFIX + userId) === "1";
  } catch {
    return false;
  }
}

export function dismissShareNudge(userId: string): void {
  try {
    localStorage.setItem(PREFIX + userId, "1");
  } catch {
    /* private mode, blocked storage */
  }
}
