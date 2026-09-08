import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAiringShows, useNowPlaying, useTmdbSearch, useTrending } from "../hooks/library";
import { useSpaces } from "../hooks/social";
import { PosterCard } from "../components/PosterCard";
import { AddMenu, type AddTarget } from "../components/AddMenu";
import type { TmdbTitle } from "../lib/types";
import { tmdbReady } from "../lib/env";

type Feed = "trending" | "movies" | "shows";

export function Library() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<Feed>("trending");
  const [q, setQ] = useState("");

  const trending = useTrending();
  const movies = useNowPlaying();
  const shows = useAiringShows();
  const search = useTmdbSearch(q);
  const { data: spaces } = useSpaces(profile?.id);

  const targets = useMemo<AddTarget[]>(() => {
    if (!profile) return [];
    const t: AddTarget[] = [{ label: "My list", owner: { type: "user", id: profile.id } }];
    for (const s of spaces ?? []) t.push({ label: s.name, owner: { type: "space", id: s.id } });
    return t;
  }, [profile, spaces]);

  if (!profile) return null;

  const active =
    q.trim().length >= 2
      ? search
      : feed === "trending"
        ? trending
        : feed === "movies"
          ? movies
          : shows;

  const results: TmdbTitle[] = active.data ?? [];

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Library</h1>
          <p className="page-sub">Search everything, or browse what is out now. Powered by TMDB.</p>
        </div>
      </div>

      {!tmdbReady && (
        <div className="card" style={{ marginBottom: 18 }}>
          Set <code>VITE_TMDB_ACCESS_TOKEN</code> in <code>.env</code> to load real titles and artwork.
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <input
            type="search"
            placeholder="Search films and series"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {!q.trim() && (
          <div className="seg">
            {(["trending", "movies", "shows"] as Feed[]).map((f) => (
              <button key={f} aria-pressed={feed === f} onClick={() => setFeed(f)}>
                {f === "trending" ? "Trending" : f === "movies" ? "In cinemas" : "On air"}
              </button>
            ))}
          </div>
        )}
      </div>

      {active.isLoading ? (
        <p className="center-note">Loading…</p>
      ) : active.error ? (
        <p className="center-note">TMDB error: {String((active.error as Error).message)}</p>
      ) : results.length === 0 ? (
        <p className="center-note">{q.trim() ? "No matches." : "Nothing to show."}</p>
      ) : (
        <div className="grid">
          {results.map((r) => (
            <div key={`${r.mediaType}-${r.tmdbId}`} style={{ position: "relative" }}>
              <PosterCard
                name={r.name}
                year={r.year}
                posterPath={r.posterPath}
                sub={
                  <span>
                    {r.mediaType === "movie" ? "Film" : "Series"}
                    {r.voteAverage ? ` · TMDB ${r.voteAverage.toFixed(1)}` : ""}
                  </span>
                }
                onClick={() => navigate(`/app/title/${r.mediaType}/${r.tmdbId}`)}
              />
              <div style={{ position: "absolute", top: 8, right: 8 }}>
                <AddMenu media={{ tmdbId: r.tmdbId, mediaType: r.mediaType }} targets={targets} selfId={profile.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
