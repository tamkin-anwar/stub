import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    t: "Your own list",
    d: "Every film and series you have seen or mean to. Watchlist, watching, watched, with your own rating and notes.",
  },
  {
    t: "A list together",
    d: "Pair with a partner and keep one shared list. You both add titles, you both rate them, and the average sits beside your names.",
  },
  {
    t: "Friends",
    d: "Find people by username, compare, and pick who you share a list with. Your personal list always stays yours.",
  },
  {
    t: "A living library",
    d: "Search the full catalogue and browse what is in cinemas and on air this week. Real posters, cast, and runtimes.",
  },
];

export function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/app" replace />;

  return (
    <div className="wrap">
      <header className="nav-inner" style={{ borderBottom: "1px solid var(--line)" }}>
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

      <section className="hero">
        <h1>Keep the reel.</h1>
        <p>
          Stub is a watch tracker you keep with the people you watch with. Your list, a shared list,
          and everything worth watching in one place.
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

      <section className="feature-grid" style={{ marginBottom: "14vh" }}>
        {FEATURES.map((f) => (
          <div className="feature" key={f.t}>
            <h3>{f.t}</h3>
            <p>{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
