import { useEffect, useState } from "react";

/** The browser's own connectivity signal. Not a guarantee the app's own
 *  servers are reachable, but enough to explain to someone why nothing
 *  is loading instead of leaving them looking at an empty page. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
