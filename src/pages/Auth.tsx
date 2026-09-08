import { useId, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { user, loading, signIn, signUp, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const ids = { u: useId(), n: useId(), e: useId(), p: useId() };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  if (!loading && user) return <Navigate to="/app" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!/^[a-z0-9_]{2,24}$/.test(username.trim().toLowerCase())) {
          throw new Error(
            "Username must be 2 to 24 characters: lowercase letters, numbers, underscore.",
          );
        }
        const { needsConfirmation } = await signUp({ email, password, username, displayName });
        if (needsConfirmation) setSentTo(email.trim());
        else navigate("/app");
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

  async function resend() {
    if (!sentTo) return;
    setErr(null);
    try {
      await resendConfirmation(sentTo);
      setResent(true);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not resend the email.");
    }
  }

  return (
    <div className="auth-shell">
      <Link to="/" className="brand auth-brand">
        <span className="dot" />
        Stub
      </Link>

      {sentTo ? (
        <div className="auth-card">
          <h1 className="display" style={{ fontSize: 26, marginBottom: 8 }}>
            Confirm your email
          </h1>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            We sent a link to <strong>{sentTo}</strong>. Open it to finish setting up your account,
            then sign in.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <Link to="/login" className="btn primary sm">
              Go to sign in
            </Link>
            <button className="btn sm" onClick={resend} disabled={resent}>
              {resent ? "Sent again" : "Resend email"}
            </button>
          </div>
          {err && <p style={{ color: "var(--bad)", fontSize: 13, marginTop: 12 }}>{err}</p>}
        </div>
      ) : (
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
                  <label htmlFor={ids.u}>Username</label>
                  <input
                    id={ids.u}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex"
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor={ids.n}>Display name</label>
                  <input
                    id={ids.n}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Rivera"
                  />
                </div>
              </>
            )}
            <div className="field">
              <label htmlFor={ids.e}>Email</label>
              <input
                id={ids.e}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor={ids.p}>Password</label>
              <input
                id={ids.p}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </div>

            {err && (
              <p style={{ color: "var(--bad)", fontSize: 13, margin: "4px 0 12px" }} role="alert">
                {err}
              </p>
            )}

            <button className="btn primary" style={{ width: "100%" }} disabled={busy}>
              {busy
                ? mode === "signup"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          {mode === "signup" && (
            <p className="muted auth-consent">
              Creating an account means you accept the <Link to="/terms">Terms</Link> and{" "}
              <Link to="/privacy">Privacy</Link> policy.
            </p>
          )}

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
      )}

      <p className="auth-by">
        by{" "}
        <a
          href="https://tamkin-anwar.github.io/anwar-creative-studio-portfolio/"
          target="_blank"
          rel="noreferrer"
        >
          Anwar Creative Studio
        </a>
      </p>
    </div>
  );
}
