import { useState } from "react";
import { Link } from "react-router-dom";
import { useFriends } from "../hooks/social";
import { dismissShareNudge, isShareNudgeDismissed } from "../lib/shareNudge";

/** A quiet, dismissible pointer to the shared-list feature for anyone who
 *  hasn't found it yet. Never shown once you have a friend (you've clearly
 *  found Friends already) or once dismissed — solo use is a complete
 *  experience on its own, this is a suggestion, not a nag. */
export function ShareNudge({ selfId }: { selfId: string | undefined }) {
  const { data: friends } = useFriends(selfId);
  const [dismissed, setDismissed] = useState(() => !selfId || isShareNudgeDismissed(selfId));

  if (!selfId) return null;
  if (dismissed) return null;
  if (friends === undefined) return null;
  if (friends.some((f) => f.direction === "friends")) return null;

  function close() {
    dismissShareNudge(selfId!);
    setDismissed(true);
  }

  return (
    <div className="card share-nudge">
      <div>
        <p className="share-nudge-title">Watching with someone?</p>
        <p className="muted" style={{ fontSize: 13.5 }}>
          Share a list with a friend, both add titles, both rate them.
        </p>
      </div>
      <div className="share-nudge-actions">
        <Link to="/app/friends" className="btn sm" onClick={close}>
          Find a friend
        </Link>
        <button type="button" className="btn ghost sm" onClick={close}>
          Not now
        </button>
      </div>
    </div>
  );
}
