import { useOnlineStatus } from "../hooks/useOnlineStatus";

/** A quiet, persistent notice while the connection is down, so a stalled
 *  list or a blank card reads as "you're offline" rather than "this app is
 *  broken." The app shell itself still loads offline (see the service
 *  worker in vite.config.ts); nothing that depends on live data is ever
 *  cached, so this banner is the honest explanation for why it's not there. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="offline-banner" role="status">
      You're offline. The app is up, but anything live won't load until you're back.
    </div>
  );
}
