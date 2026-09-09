import { Link } from "react-router-dom";
import type { ReactNode } from "react";

// Swap in a real inbox once there is one; until then, GitHub issues are the
// contact route and this stays blank so no address is published.
const CONTACT_EMAIL = "";
const UPDATED = "9 September 2026";
const REPO = "https://github.com/tamkin-anwar/stub/issues";

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="landing-bg">
      <div className="wrap legal">
        <Link to="/" className="brand auth-brand" style={{ marginTop: 40 }}>
          <span className="dot" />
          Stub
        </Link>
        <h1 className="display" style={{ fontSize: 34, margin: "8px 0 6px" }}>
          {title}
        </h1>
        <p className="eyebrow" style={{ marginBottom: 30 }}>
          Last updated {UPDATED}
        </p>
        {children}
        <p style={{ marginTop: 40 }}>
          <Link to="/">Back to Stub</Link>
        </p>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <p>
      Questions about any of this: open an issue on{" "}
      <a href={REPO} target="_blank" rel="noreferrer">
        GitHub
      </a>
      {CONTACT_EMAIL ? (
        <>
          {" "}
          or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </>
      ) : null}
      .
    </p>
  );
}

export function Privacy() {
  return (
    <Shell title="Privacy">
      <p>
        Stub is a small watch-list app. This page says plainly what it stores about you and who
        else can see it. There is no analytics, no advertising, and no tracking of what you do in
        the app. The one thing that leaves your browser beyond the essentials is a crash report,
        and only when something actually breaks. That is covered under <em>Diagnostics</em> below.
      </p>

      <h2>What Stub stores</h2>
      <ul>
        <li>
          <strong>Your account:</strong> the email you sign up with, your username, your display
          name, your avatar colour, and the date you joined.
        </li>
        <li>
          <strong>Your lists:</strong> the films and shows you add, their status (watchlist,
          watching, watched), any watch dates, your ratings, and your notes.
        </li>
        <li>
          <strong>Your connections:</strong> friend requests you send or accept, and any shared
          list you create with someone.
        </li>
      </ul>
      <p>
        The only thing kept in your browser is the sign-in token that keeps you logged in, plus
        your theme choice. No third-party cookies.
      </p>

      <h2>Who processes it</h2>
      <ul>
        <li>
          <strong>Supabase</strong> hosts the database and handles sign-in. Your account and list
          data live there.
        </li>
        <li>
          <strong>Vercel</strong> serves the app and keeps standard short-lived access logs.
        </li>
        <li>
          <strong>TMDB</strong>, <strong>OMDb</strong> and <strong>The Guardian</strong> supply
          film and show data, scores and the press feed. Those requests go through Stub's own
          server, so the providers see the server, not you. Artwork and press thumbnails load
          straight from their image servers, which see your IP address when an image loads but
          nothing about your Stub account.
        </li>
        <li>
          <strong>Sentry</strong> receives crash reports, described next.
        </li>
      </ul>

      <h2>Diagnostics</h2>
      <p>
        If the app hits an unexpected error, Stub sends a crash report to Sentry, an
        error-tracking service, so it can be found and fixed. A report contains the error message,
        where in the code it happened, the page you were on, and your browser type. It does not
        contain your email, your lists, your notes, or anything you typed. Reports are sent only
        when something breaks, never during normal use.
      </p>

      <h2>Keeping and deleting it</h2>
      <p>
        Your data stays until you remove it. You can export your whole list at any time from
        Settings, under <em>Your data</em>. Deleting your account, from the danger zone in
        Settings, immediately removes your profile, your personal lists and ratings, your
        friendships and your sign-in. Titles you added to a shared list stay on that list for the
        other person.
      </p>

      <h2>Children</h2>
      <p>Stub is not directed at children under 13 and does not knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that matters, the date at the top will change. Continued
        use after that means you accept the update.
      </p>

      <Contact />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Terms">
      <p>
        Stub is provided as a personal project, free, and as-is. Using it means you accept the
        following.
      </p>

      <h2>Your account</h2>
      <p>
        Keep your password to yourself and use a real email so you can recover access. You are
        responsible for what happens under your account.
      </p>

      <h2>Fair use</h2>
      <ul>
        <li>Do not scrape, hammer, or try to break the service or its rate limits.</li>
        <li>Do not put unlawful, hateful, or harassing content in notes or names.</li>
        <li>Be decent to the people you connect with. Shared lists take two.</li>
      </ul>
      <p>Accounts that abuse the service can be suspended or removed.</p>

      <h2>Other people&rsquo;s content</h2>
      <p>
        Film and show details and images come from TMDB and belong to their respective owners.
        Stub uses the TMDB API but is not endorsed or certified by TMDB. Ratings come from OMDb.
        Headlines in the press feed come from The Guardian&rsquo;s Open Platform and link back to
        theguardian.com; the full articles stay on their site.
      </p>

      <h2>No warranty</h2>
      <p>
        The service may change, break, or shut down, and data can be lost. Keep your own export
        if a title list matters to you. To the extent the law allows, Stub and its maker are not
        liable for any loss arising from use of the service.
      </p>

      <h2>Changes</h2>
      <p>
        These terms can change; the date at the top will move when they do. If you do not agree
        with an update, stop using Stub and delete your account.
      </p>

      <Contact />
    </Shell>
  );
}
