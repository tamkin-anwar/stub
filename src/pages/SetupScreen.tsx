import { missingConfig } from "../lib/env";

export function SetupScreen() {
  return (
    <div className="auth-shell">
      <span className="brand auth-brand">
        <span className="dot" />
        Stub
      </span>
      <div className="auth-card auth-card-wide">
        <h1 className="display" style={{ fontSize: 27, marginBottom: 8 }}>
          Almost there
        </h1>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Copy <code>.env.example</code> to <code>.env</code> and fill in these values, then restart the
          dev server:
        </p>
        <ul style={{ fontSize: 13.5, lineHeight: 1.9, paddingLeft: 18 }}>
          {missingConfig.map((k) => (
            <li key={k}>
              <code>{k}</code>
            </li>
          ))}
        </ul>
        <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
          Supabase keys are in your project settings under API. The TMDB read access token is at
          themoviedb.org, Settings, API. Run the SQL in <code>supabase/migrations/0001_init.sql</code>{" "}
          once in the Supabase SQL editor.
        </p>
      </div>
    </div>
  );
}
