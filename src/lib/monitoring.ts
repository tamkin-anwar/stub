/**
 * Minimal error reporting. When VITE_SENTRY_DSN is set, uncaught errors,
 * unhandled promise rejections and React render crashes are posted to
 * Sentry's store endpoint. No SDK: this is a few lines and weighs nothing
 * when the DSN is unset, which it is by default.
 */

const DSN = import.meta.env.VITE_SENTRY_DSN?.trim();
const RELEASE = (import.meta.env.VITE_COMMIT_SHA || "").slice(0, 12) || "dev";
const MAX_EVENTS = 12;

interface Endpoint {
  url: string;
  key: string;
}

export function parseDsn(dsn: string): Endpoint | null {
  try {
    const u = new URL(dsn);
    const projectId = u.pathname.replace(/^\/+/, "");
    if (!u.username || !projectId) return null;
    return { key: u.username, url: `${u.protocol}//${u.host}/api/${projectId}/store/` };
  } catch {
    return null;
  }
}

const target = DSN ? parseDsn(DSN) : null;
const seen = new Set<string>();
let sent = 0;

function frames(err: Error) {
  const rows = (err.stack || "")
    .split("\n")
    .slice(1, 30)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => ({ function: l }))
    .reverse(); // Sentry wants innermost last
  return rows.length ? { frames: rows } : undefined;
}

function eventId(): string {
  try {
    return crypto.randomUUID().replace(/-/g, "");
  } catch {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  }
}

/** Send one error to Sentry. No-ops when the DSN is unset, on repeats, and
 *  past a small per-session cap so a render loop can't spam the project. */
export function reportError(err: unknown, extra?: Record<string, unknown>): void {
  if (!target || sent >= MAX_EVENTS) return;

  const e = err instanceof Error ? err : new Error(typeof err === "string" ? err : "Unknown error");
  const sig = `${e.name}:${e.message}`;
  if (seen.has(sig)) return;
  seen.add(sig);
  sent += 1;

  const body = JSON.stringify({
    event_id: eventId(),
    timestamp: new Date().toISOString(),
    platform: "javascript",
    level: "error",
    release: RELEASE,
    environment: import.meta.env.MODE,
    request: { url: location.href },
    exception: { values: [{ type: e.name || "Error", value: e.message, stacktrace: frames(e) }] },
    extra: { userAgent: navigator.userAgent, ...extra },
  });

  void fetch(`${target.url}?sentry_key=${target.key}&sentry_version=7`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

/** Wire the browser's global error hooks. Call once at startup. */
export function initMonitoring(): void {
  if (!target) return;
  window.addEventListener("error", (ev) => reportError(ev.error ?? ev.message));
  window.addEventListener("unhandledrejection", (ev) => reportError(ev.reason));
}
