import type { ListEntry, Profile } from "./types";

const PALETTE: [string, string][] = [
  ["#0c2b2e", "#1f5c5c"],
  ["#2a0f12", "#6e2230"],
  ["#1e1230", "#4a2a63"],
  ["#10230f", "#2f5d2c"],
  ["#10152e", "#2c3a70"],
  ["#2b1305", "#7a3a17"],
  ["#171b20", "#3d4a56"],
  ["#2a2205", "#7d6216"],
  ["#290f0a", "#7a2f22"],
  ["#1a2213", "#46592f"],
  ["#0b1220", "#223a5e"],
  ["#22101d", "#5a2650"],
];

export function hashIndex(str: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function posterGradient(seed: string): { d: string; m: string } {
  const [d, m] = PALETTE[hashIndex(seed, PALETTE.length)];
  return { d, m };
}

export function initials(nameOrHandle: string): string {
  const parts = nameOrHandle.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function displayName(p: Pick<Profile, "display_name" | "username">): string {
  return p.display_name?.trim() || p.username;
}

export function entryAverage(entry: ListEntry): number | null {
  if (!entry.ratings.length) return null;
  const sum = entry.ratings.reduce((acc, r) => acc + Number(r.stars), 0);
  return Math.round((sum / entry.ratings.length) * 10) / 10;
}

export function ratingFor(entry: ListEntry, userId: string): number | null {
  const r = entry.ratings.find((x) => x.user_id === userId);
  return r ? Number(r.stars) : null;
}

export function runtimeLabel(minutes: number | null, mediaType: "movie" | "tv"): string | null {
  if (!minutes) return null;
  if (mediaType === "tv") return `${minutes} min episodes`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function statusLabel(status: ListEntry["status"]): string {
  return status === "watchlist" ? "Watchlist" : status === "watching" ? "Watching" : "Watched";
}

/** Short relative time: "just now", "5m", "3h", "2d", "3w", then a date. */
export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.round(d / 7);
  if (w < 5) return `${w}w`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
