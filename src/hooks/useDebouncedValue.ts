import { useEffect, useState } from "react";

/** The given value, delayed until it's stopped changing for `delayMs`.
 *  Keeps a fast typist from firing one query per keystroke against a
 *  now-rate-limited search endpoint. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
