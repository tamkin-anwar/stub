import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!loading && user) return <Navigate to="/app" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!/^[a-z0-9_]{2,24}$/.test(username.trim().toLowerCase())) {
          throw new Error("Username must be 2 to 24 characters: lowercase letters, numbers, underscore.");
        }
        await signUp({ email, password, username, displayName });
        setNotice("Account created. If email confirmation is on, check your inbox, then sign in.");
        setTimeout(() => navigate("/login"), 1600);
      } else {
        await signIn({ email, password });
        navigate("/app");
      }
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <Link to="/" className="brand" style={{ display: "inline-flex", marginBottom: 22 }}>
        <span className="dot" />
        Stub
      </Link>
      <div className="auth-card">
        <h1 className="display" style={{ fontSize: 29, marginBottom: 6 }}>
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>
          {mode === "signup" ? "Your list travels with you." : "Sign in to your list."}
        </p>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <>
              <div className="field">
                <label>Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="lowercase_handle"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="field">
                <label>Display name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="What friends see"
                />
              </div>
            </>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </div>

          {err && (
            <p style={{ color: "var(--bad)", fontSize: 13, margin: "4px 0 12px" }}>{err}</p>
          )}
          {notice && (
            <p style={{ color: "var(--ok)", fontSize: 13, margin: "4px 0 12px" }}>{notice}</p>
          )}

          <button className="btn primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="muted" style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>
          {mode === "signup" ? (
            <>
              Already have one? <Link to="/login">Sign in</Link>
            </>
          ) : (
            <>
              New here? <Link to="/signup">Create an account</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
