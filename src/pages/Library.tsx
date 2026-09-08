import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBrowse, useCardScores, useTmdbSearch } from "../hooks/library";
import { useSpaces } from "../hooks/social";
import { PosterCard } from "../components/PosterCard";
import { AddMenu, type AddTarget } from "../components/AddMenu";
import { GENRES, type BrowseFeed, type MediaFilter } from "../lib/tmdb";
import type { TmdbTitle } from "../lib/types";
import { tmdbReady } from "../lib/env";

function ResultCard({
  r,
  targets,
  selfId,
  onOpen,
}: {
  r: TmdbTitle;
  targets: AddTarget[];
  selfId: string;
  onOpen: () => void;
}) {
  const cs = useCardScores(r.mediaType, r.tmdbId, true);
  const kind = r.mediaType === "movie" ? "Film" : "Series";
  const hasImdb = typeof cs.data?.imdb === "number" && cs.data.imdb > 0;
  const hasRt = typeof cs.data?.rt === "number" && cs.data.rt > 0;

  return (
    <div style={{ position: "relative" }}>
      <PosterCard
        name={r.name}
        year={r.year}
        posterPath={r.posterPath}
        sub={
          <span className="scores">
            <span className="tmdb">{kind}</span>
            {hasImdb && <span className="imdb">IMDb {cs.data!.imdb!.toFixed(1)}</span>}
            {hasRt && <span className="rt">RT {Math.round(cs.data!.rt!)}%</span>}
            {!hasImdb && !hasRt && r.voteAverage ? (
              <span className="tmdb">TMDB {r.voteAverage.toFixed(1)}</span>
            ) : null}
          </span>
        }
        onClick={onOpen}
      />
      <div style={{ position: "absolute", top: 8, right: 8 }}>
        <AddMenu media={{ tmdbId: r.tmdbId, mediaType: r.mediaType }} targets={targets} selfId={selfId} />
      </div>
    </div>
  );
}

const FEEDS: { key: BrowseFeed; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top rated" },
  { key: "now_playing", label: "In cinemas" },
  { key: "on_air", label: "On air" },
];

export function Library() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [media, setMedia] = useState<MediaFilter>("all");
  const [feed, setFeed] = useState<BrowseFeed>("trending");
  const [genre, setGenre] = useState<string | null>(null);

  const genreOpt = genre ? GENRES.find((g) => g.name === genre) : undefined;
  // "In cinemas" is movies only, "On air" is series only.
  const effMedia: MediaFilter =
    feed === "now_playing" ? "movie" : feed === "on_air" ? "tv" : media;

  const browse = useBrowse({
    feed: genreOpt ? "popular" : feed,
    media: effMedia,
    movieGenre: genreOpt?.movieId,
    tvGenre: genreOpt?.tvId,
  });
  const search = useTmdbSearch(q);
  const { data: spaces } = useSpaces(profile?.id);

  const targets = useMemo<AddTarget[]>(() => {
    if (!profile) return [];
    const t: AddTarget[] = [{ label: "My list", owner: { type: "user", id: profile.id } }];
    for (const s of spaces ?? []) t.push({ label: s.name, owner: { type: "space", id: s.id } });
    return t;
  }, [profile, spaces]);

  if (!profile) return null;

  const searching = q.trim().length >= 2;
  const results: TmdbTitle[] = searching
    ? (search.data ?? [])
    : (browse.data?.pages.flatMap((p) => p.items) ?? []);
  const state = searching ? search : browse;
  const seen = new Set<string>();
  const unique = results.filter((r) => {
    const k = `${r.mediaType}-${r.tmdbId}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Library</h1>
          <p className="page-sub">Search TMDB's whole catalogue, or browse by feed and genre.</p>
        </div>
      </div>

      {!tmdbReady && (
        <div className="card" style={{ marginBottom: 18 }}>
          Set <code>VITE_TMDB_ACCESS_TOKEN</code> in <code>.env</code> to load real titles and artwork.
        </div>
      )}

      <div className="search-box" style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Search films and series"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {!searching && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div className="seg">
              {(["all", "movie", "tv"] as MediaFilter[]).map((m) => (
                <button
                  key={m}
                  aria-pressed={media === m}
                  disabled={feed === "now_playing" || feed === "on_air"}
                  onClick={() => setMedia(m)}
                >
                  {m === "all" ? "All" : m === "movie" ? "Films" : "Series"}
                </button>
              ))}
            </div>
            <div className="chips">
              {FEEDS.map((f) => (
                <button
                  key={f.key}
                  className="chip"
                  aria-pressed={!genre && feed === f.key}
                  onClick={() => {
                    setGenre(null);
                    setFeed(f.key);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="chips">
            {GENRES.map((g) => (
              <button
                key={g.name}
                className="chip"
                aria-pressed={genre === g.name}
                onClick={() => setGenre(genre === g.name ? null : g.name)}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.isLoading ? (
        <p className="center-note">Loading…</p>
      ) : state.error ? (
        <p className="center-note">TMDB error: {String((state.error as Error).message)}</p>
      ) : unique.length === 0 ? (
        <p className="center-note">{searching ? "No matches." : "Nothing to show."}</p>
      ) : (
        <>
          <div className="grid">
            {unique.map((r) => (
              <ResultCard
                key={`${r.mediaType}-${r.tmdbId}`}
                r={r}
                targets={targets}
                selfId={profile.id}
                onOpen={() => navigate(`/app/title/${r.mediaType}/${r.tmdbId}`)}
              />
            ))}
          </div>

          {!searching && browse.hasNextPage && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button
                className="btn"
                disabled={browse.isFetchingNextPage}
                onClick={() => browse.fetchNextPage()}
              >
                {browse.isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
