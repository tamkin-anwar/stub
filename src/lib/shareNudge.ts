// A one-time hint that a shared list exists, dismissed for good once acted
// on or closed. Device-local like the theme preference: not worth a column.

const KEY = "stub-dismissed-share-nudge";

export function isShareNudgeDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissShareNudge(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* private mode, blocked storage */
  }
}
