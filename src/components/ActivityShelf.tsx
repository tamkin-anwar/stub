import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFriendActivity } from "../hooks/social";
import { Avatar } from "./Avatar";
import { Shelf } from "./Shelf";
import { posterUrl } from "../lib/tmdb";
import { storedPosterUrl } from "../lib/posters";
import { timeAgo } from "../lib/format";

/** "From friends": the latest ratings people you're friends with left on
 *  their own lists. Renders nothing when there is no activity yet. */
export function ActivityShelf() {
  const { profile } = useAuth();
  const activity = useFriendActivity(profile?.id);
  const navigate = useNavigate();

  if (!profile) return null;

  // Supplementary shelf: show a skeleton only during an active first fetch,
  // and otherwise just stay hidden when there is nothing (or nothing loaded).
  if (activity.isLoading) {
    return (
      <Shelf label="Recently rated" title="From friends">
        <div className="card">
          {[0, 1, 2].map((i) => (
            <div className="row" key={i}>
              <div className="skel" style={{ width: 30, height: 30, borderRadius: "50%" }} />
              <div className="skel skel-line grow" style={{ maxWidth: 280 }} />
            </div>
          ))}
        </div>
      </Shelf>
    );
  }

  const items = activity.data ?? [];
  if (!items.length) return null;

  return (
    <Shelf label="Recently rated" title="From friends">
      <div className="card">
        {items.slice(0, 8).map((a, i) => {
          const who = a.displayName?.trim() || a.username;
          const poster = storedPosterUrl(a.posterPath) ?? posterUrl(a.posterPath, "w185");
          return (
            <button
              key={`${a.actorId}-${a.tmdbId}-${i}`}
              type="button"
              className="row activity-row"
              onClick={() => navigate(`/app/title/${a.mediaType}/${a.tmdbId}`)}
            >
              <Avatar name={who} accent={a.accent} />
              <span className="grow activity-text">
                <span className="activity-line">
                  <strong>{who}</strong> rated <strong>{a.name}</strong>
                  {a.year ? ` (${a.year})` : ""}
                </span>
                <span className="handle">
                  ★ {a.stars.toFixed(1)} · {timeAgo(a.ratedAt)}
                </span>
              </span>
              {poster && <img className="activity-thumb" src={poster} alt="" loading="lazy" />}
            </button>
          );
        })}
      </div>
    </Shelf>
  );
}
