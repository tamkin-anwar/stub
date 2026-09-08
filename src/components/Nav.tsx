import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Avatar";
import { displayName } from "../lib/format";

export function Nav() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <NavLink to="/app" className="brand">
          <span className="dot" />
          Stub
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/app" end className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          <NavLink to="/app/list" className={({ isActive }) => (isActive ? "active" : "")}>
            My list
          </NavLink>
          <NavLink to="/app/library" className={({ isActive }) => (isActive ? "active" : "")}>
            Library
          </NavLink>
          <NavLink to="/app/shared" className={({ isActive }) => (isActive ? "active" : "")}>
            Shared
          </NavLink>
          <NavLink to="/app/friends" className={({ isActive }) => (isActive ? "active" : "")}>
            Friends
          </NavLink>
        </nav>
        <div className="nav-spacer" />
        <div className="nav-user">
          {profile && (
            <>
              <button
                className="btn ghost sm"
                onClick={() => navigate("/app/settings")}
                title="Settings"
              >
                <Avatar name={displayName(profile)} accent={profile.accent} />
                <span>@{profile.username}</span>
              </button>
              <button className="btn ghost sm" onClick={() => void signOut()}>
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
