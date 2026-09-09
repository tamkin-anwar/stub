import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TITLES: [RegExp, string][] = [
  [/^\/$/, "Stub"],
  [/^\/login/, "Sign in · Stub"],
  [/^\/signup/, "Create account · Stub"],
  [/^\/privacy/, "Privacy · Stub"],
  [/^\/terms/, "Terms · Stub"],
  [/^\/app\/list/, "My list · Stub"],
  [/^\/app\/library/, "Library · Stub"],
  [/^\/app\/shared/, "Shared · Stub"],
  [/^\/app\/friends/, "Friends · Stub"],
  [/^\/app\/compare/, "Compare · Stub"],
  [/^\/app\/settings/, "Settings · Stub"],
  [/^\/app\/title\//, "Stub"],
  [/^\/app/, "Home · Stub"],
];

/** Keeps the browser tab / history label in step with the route. */
export function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const match = TITLES.find(([re]) => re.test(pathname));
    document.title = match ? match[1] : "Stub";
  }, [pathname]);
  return null;
}
