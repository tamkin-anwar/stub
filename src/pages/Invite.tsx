import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfileByUsername, sendFriendRequest } from "../data/social";
import { useToast } from "../components/Toast";

/** Landed on from someone's "share a list with me" link. Logged out, it
 *  routes into signup/login carrying the invite along; logged in, it sends
 *  the friend request itself and drops the visitor straight into Friends,
 *  so accepting an invite is never more than the one link. */
export function Invite() {
  const { username } = useParams<{ username: string }>();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [state, setState] = useState<"working" | "invalid" | "self">("working");
  const ran = useRef(false);

  useEffect(() => {
    if (loading || !user || !profile || !username || ran.current) return;
    ran.current = true;

    if (username.toLowerCase() === profile.username.toLowerCase()) {
      setState("self");
      return;
    }

    (async () => {
      try {
        const target = await getProfileByUsername(username);
        if (!target) {
          setState("invalid");
          return;
        }
        await sendFriendRequest(target.id);
        toast(`Friend request sent to ${target.display_name?.trim() || target.username}`);
        navigate("/app/friends", { replace: true });
      } catch {
        toast("Could not send that request", { error: true });
        navigate("/app/friends", { replace: true });
      }
    })();
  }, [loading, user, profile, username, navigate, toast]);

  if (loading) return null;

  if (!username) return null;

  if (!user) {
    return (
      <div className="auth-shell">
        <Link to="/" className="brand auth-brand">
          <span className="dot" />
          Stub
        </Link>
        <div className="auth-card">
          <h1 className="display" style={{ fontSize: 26, marginBottom: 8 }}>
            You're invited
          </h1>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>
            <strong>@{username}</strong> wants to share a list with you on Stub.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to={`/signup?invite=${encodeURIComponent(username)}`} className="btn primary sm">
              Create your account
            </Link>
            <Link to={`/login?invite=${encodeURIComponent(username)}`} className="btn sm">
              I have an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state === "self") {
    return (
      <div className="wrap page">
        <p className="center-note">
          That's your own invite link. Share it with the person you want to watch with instead.
        </p>
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="wrap page">
        <p className="center-note">
          That invite link isn't valid anymore.{" "}
          <Link to="/app/friends" className="link-accent">Find them by username instead.</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="wrap page">
      <p className="center-note">Sending the request…</p>
    </div>
  );
}
