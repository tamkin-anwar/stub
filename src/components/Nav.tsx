import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Avatar";
import { NotificationBell } from "./NotificationBell";
import { displayName } from "../lib/format";

const LINKS: [string, string][] = [
  ["/app", "Home"],
  ["/app/list", "My list"],
  ["/app/library", "Library"],
  ["/app/shared", "Shared"],
  ["/app/friends", "Friends"],
];

export function Nav() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <NavLink to="/app" className="brand" end>
          <span className="dot" />
          Stub
        </NavLink>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/app"} className={({ isActive }) => (isActive ? "active" : "")}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-spacer" />
        <div className="nav-user">
          {profile && (
            <>
              <NotificationBell />
              <button
                className="btn ghost sm"
                onClick={() => navigate("/app/settings")}
                aria-label={`Settings, signed in as @${profile.username}`}
              >
                <Avatar name={displayName(profile)} accent={profile.accent} avatarStyle={profile.avatar_style} />
                <span className="nav-username">@{profile.username}</span>
              </button>
              <button className="btn ghost sm nav-signout" onClick={() => void signOut()}>
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
