import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    t: "Your own list",
    d: "Every film and series you've seen, or mean to. Mark each one watchlist, watching or watched, and leave a rating and a note.",
  },
  {
    t: "A list together",
    d: "Share one list with the person you watch with. You both add titles, you both rate them, and your two scores sit side by side.",
  },
  {
    t: "Friends",
    d: "Find people by username and see what they've been watching. You decide who you keep a shared list with. Your own stays private.",
  },
  {
    t: "Look it up",
    d: "Search the whole catalogue for posters, cast, runtimes and scores. Or just see what's in cinemas and on air this week.",
  },
];

export function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/app" replace />;

  return (
    <div className="landing-bg">
    <div className="wrap">
      <header className="nav-inner" style={{ borderBottom: "1px solid var(--line-2)" }}>
        <span className="brand">
          <span className="dot" />
          Stub
        </span>
        <div className="nav-spacer" />
        <Link to="/login" className="btn ghost sm">
          Sign in
        </Link>
        <Link to="/signup" className="btn primary sm">
          Create account
        </Link>
      </header>

      <main>
      <section className="hero">
        <h1>Keep the stub.</h1>
        <p>
          A record of what you've watched and what you made of it. Keep your own, and share a list
          with the person you watch with most.
        </p>
        <div className="cta">
          <Link to="/signup" className="btn primary">
            Start your list
          </Link>
          <Link to="/login" className="btn">
            I have an account
          </Link>
        </div>
      </section>

      <section className="feature-grid" style={{ marginBottom: "10vh" }}>
        {FEATURES.map((f) => (
          <div className="feature" key={f.t}>
            <h3>{f.t}</h3>
            <p>{f.d}</p>
          </div>
        ))}
      </section>
      </main>

      <footer className="site-foot">
        <span className="brand-mini">
          <span className="dot" />
          Stub
        </span>
        <span className="site-foot-by">
          by{" "}
          <a
            href="https://tamkin-anwar.github.io/anwar-creative-studio-portfolio/"
            target="_blank"
            rel="noreferrer"
          >
            Anwar Creative Studio
          </a>
        </span>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <a href="https://github.com/tamkin-anwar/stub" target="_blank" rel="noreferrer">
          Source
        </a>
      </footer>
    </div>
    </div>
  );
}
