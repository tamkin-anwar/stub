import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/notifications";
import type { NotificationItem } from "../data/notifications";
import { Avatar } from "./Avatar";
import { posterUrl } from "../lib/tmdb";
import { storedPosterUrl } from "../lib/posters";
import { timeAgo } from "../lib/format";

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a6 6 0 0 0-12 0c0 5.5-2 7.5-2 7.5h16S18 13.5 18 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 19a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function label(n: NotificationItem): string {
  return n.kind === "rating" ? "rated" : "left a note on";
}

/** A bell in the nav that lights up when someone you share a list with
 *  rates a title or leaves a note there. Live: a realtime subscription
 *  keeps the count current without a refresh. */
export function NotificationBell() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data } = useNotifications(profile?.id);
  const markRead = useMarkNotificationRead(profile?.id);
  const markAll = useMarkAllNotificationsRead(profile?.id);

  if (!profile) return null;

  const items = data ?? [];
  const unread = items.filter((n) => !n.read).length;

  function openItem(n: NotificationItem) {
    if (!n.read) markRead.mutate(n.id);
    setOpen(false);
    navigate("/app/shared");
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="btn ghost sm notif-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      >
        <BellIcon />
        {unread > 0 && <span className="notif-dot">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <>
          <div
            className="add-menu-scrim"
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="card add-menu-pop notif-pop"
            role="menu"
            style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 41 }}
          >
            <div className="notif-head">
              <span className="eyebrow">Notifications</span>
              {unread > 0 && (
                <button className="btn ghost sm" onClick={() => markAll.mutate()}>
                  Mark all read
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="muted" style={{ fontSize: 13.5, padding: "6px 8px 12px" }}>
                Nothing yet. You will hear about it when someone rates or notes something on a
                list you share.
              </p>
            ) : (
              items.map((n) => {
                const poster = storedPosterUrl(n.posterPath) ?? posterUrl(n.posterPath, "w185");
                return (
                  <button
                    key={n.id}
                    type="button"
                    role="menuitem"
                    className={`row activity-row${n.read ? "" : " notif-unread"}`}
                    onClick={() => openItem(n)}
                  >
                    <Avatar name={n.actorName} accent={n.actorAccent} avatarStyle={n.actorAvatarStyle} />
                    <span className="grow activity-text">
                      <span className="activity-line">
                        <strong>{n.actorName}</strong> {label(n)} <strong>{n.titleName}</strong>
                        {n.kind === "rating" && n.stars ? ` · ★${n.stars.toFixed(1)}` : ""}
                      </span>
                      <span className="handle">
                        {n.spaceName} · {timeAgo(n.createdAt)}
                      </span>
                    </span>
                    {poster && <img className="activity-thumb" src={poster} alt="" loading="lazy" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
