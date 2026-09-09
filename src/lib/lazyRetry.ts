import { lazy, type ComponentType } from "react";

const FLAG = "stub-chunk-reload";

/**
 * `React.lazy` that survives a deploy landing mid-session. When a route's
 * chunk 404s because its hash changed, do one hard reload to pick up the
 * fresh index.html and chunks. The flag stops a reload loop if the chunk is
 * genuinely unreachable, and clears once any chunk loads again.
 */
export function lazyRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      try {
        sessionStorage.removeItem(FLAG);
      } catch {
        /* private mode */
      }
      return mod;
    } catch (err) {
      let reloaded = false;
      try {
        reloaded = sessionStorage.getItem(FLAG) === "1";
        if (!reloaded) sessionStorage.setItem(FLAG, "1");
      } catch {
        /* private mode: fall through and rethrow */
      }
      if (!reloaded) {
        window.location.reload();
        // Hold Suspense until the page navigates away.
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
