// Theme preference. "system" follows the OS via prefers-color-scheme (no
// attribute); "light"/"dark" force it by stamping data-theme on <html>, which
// the token blocks in global.css key off. A tiny inline script in index.html
// applies the stored choice before first paint so there is no flash.

export type Theme = "system" | "light" | "dark";

const KEY = "stub-theme";

export function getTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* private mode, blocked storage */
  }
  return "system";
}

export function applyTheme(t: Theme): void {
  const root = document.documentElement;
  if (t === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", t);
}

export function setTheme(t: Theme): void {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
  applyTheme(t);
}
