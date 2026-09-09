import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBrowse, useTmdbSearch } from "../hooks/library";
import { useMyEntryLookup } from "../hooks/lists";
import { useSpaces } from "../hooks/social";
import { DiscoverCard } from "../components/DiscoverCard";
import { ScoreLegend } from "../components/ScoreLegend";
import { EmptyState, GridSkeleton, LoadError } from "../components/States";
import { type AddTarget } from "../components/AddMenu";
import { GENRES, type BrowseFeed, type MediaFilter } from "../lib/tmdb";
import type { TmdbTitle } from "../lib/types";

const FEEDS: { key: BrowseFeed; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top rated" },
  { key: "now_playing", label: "In cinemas" },
  { key: "on_air", label: "On air" },
];

type LibSort = "match" | "rating" | "year" | "title";

function sortTitles(rows: TmdbTitle[], by: LibSort): TmdbTitle[] {
  if (by === "match") return rows;
  const out = [...rows];
  if (by === "rating") out.sort((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0));
  else if (by === "year") out.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  else out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export function Library() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [media, setMedia] = useState<MediaFilter>("all");
  const [feed, setFeed] = useState<BrowseFeed>("trending");
  const [genre, setGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<LibSort>("match");

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
  const mine = useMyEntryLookup(profile?.id);

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
  const ordered = sortTitles(unique, sort);

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Library</h1>
          <p className="page-sub">Search TMDB's whole catalogue, or browse by feed and genre.</p>
        </div>
      </div>

      <ScoreLegend />

      <div className="search-box" style={{ marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Search films and series"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
          marginBottom: searching ? 16 : 14,
        }}
      >
        <span className="eyebrow">Sort</span>
        <select
          style={{ width: "auto" }}
          value={sort}
          onChange={(e) => setSort(e.target.value as LibSort)}
          aria-label="Sort results"
        >
          <option value="match">Best match</option>
          <option value="rating">Rating</option>
          <option value="year">Newest</option>
          <option value="title">A to Z</option>
        </select>
      </div>

      {!searching && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div className="seg">
              {(["all", "movie", "tv"] as MediaFilter[]).map((m) => (
                <button
                  key={m}
                  aria-pressed={effMedia === m}
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
        <GridSkeleton />
      ) : state.error ? (
        <LoadError onRetry={() => state.refetch()} />
      ) : unique.length === 0 ? (
        <EmptyState
          title={searching ? "No matches" : "Nothing to show here"}
          hint={
            searching
              ? "Try another spelling, or a shorter search."
              : "Pick a different feed or genre above."
          }
        />
      ) : (
        <>
          <div className="grid">
            {ordered.map((r) => (
              <DiscoverCard
                key={`${r.mediaType}-${r.tmdbId}`}
                r={r}
                targets={targets}
                selfId={profile.id}
                mine={mine.get(`${r.mediaType}-${r.tmdbId}`) ?? null}
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
