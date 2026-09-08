import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ListEntry, ListStatus, MediaType, Profile } from "../lib/types";
import type { ListOwner } from "../data/lists";
import { useEntries } from "../hooks/lists";
import { PosterCard } from "./PosterCard";
import { EntrySheet } from "./EntrySheet";
import { ScorePills } from "./ScorePills";
import { entryAverage } from "../lib/format";

type StatusFilter = "all" | ListStatus;
type TypeFilter = "all" | MediaType;
type Sort = "added" | "title" | "year" | "rating";

interface Props {
  owner: ListOwner;
  members: Profile[];
  selfId: string;
  emptyHint?: string;
}

export function ListView({ owner, members, selfId, emptyHint }: Props) {
  const { data: entries, isLoading, error } = useEntries(owner);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<Sort>("added");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { all: 0, watchlist: 0, watching: 0, watched: 0 } as Record<StatusFilter, number>;
    for (const e of entries ?? []) {
      if (type !== "all" && e.title.media_type !== type) continue;
      c.all++;
      c[e.status]++;
    }
    return c;
  }, [entries, type]);

  const visible = useMemo(() => {
    let rows = (entries ?? []).filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (type !== "all" && e.title.media_type !== type) return false;
      if (q.trim() && !e.title.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "title") return a.title.name.localeCompare(b.title.name);
      if (sort === "year") return (b.title.year ?? 0) - (a.title.year ?? 0);
      if (sort === "rating") return (entryAverage(b) ?? -1) - (entryAverage(a) ?? -1);
      return +new Date(b.created_at) - +new Date(a.created_at);
    });
    return rows;
  }, [entries, status, type, q, sort]);

  const open = openId ? (entries ?? []).find((e) => e.id === openId) ?? null : null;

  if (error) {
    return <p className="center-note">Could not load this list. {String((error as Error).message)}</p>;
  }

  return (
    <>
      <div className="list-toolbar">
        <div className="seg">
          {(["all", "movie", "tv"] as TypeFilter[]).map((t) => (
            <button key={t} aria-pressed={type === t} onClick={() => setType(t)}>
              {t === "all" ? "All" : t === "movie" ? "Films" : "Series"}
            </button>
          ))}
        </div>
        <div className="chips">
          {(["all", "watchlist", "watching", "watched"] as StatusFilter[]).map((s) => (
            <button key={s} className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s === "all" ? "Everything" : s[0].toUpperCase() + s.slice(1)} {counts[s]}
            </button>
          ))}
        </div>
        <div className="search-box" style={{ flex: 1, minWidth: 160 }}>
          <input placeholder="Search this list" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="added">Recently added</option>
          <option value="title">Title</option>
          <option value="year">Year</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {isLoading ? (
        <p className="center-note">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="center-note">
          <p>Nothing here yet.</p>
          <p>
            {emptyHint ?? (
              <>
                Head to the <Link to="/app/library">Library</Link> to add something.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="grid">
          {visible.map((e) => (
            <PosterCard
              key={e.id}
              name={e.title.name}
              year={e.title.year}
              posterPath={e.title.poster_path}
              badge={e.status === "watched" ? "watched" : e.status === "watching" ? "watching" : null}
              sub={<EntrySub entry={e} />}
              onClick={() => setOpenId(e.id)}
            />
          ))}
        </div>
      )}

      {open && (
        <EntrySheet
          entry={open}
          owner={owner}
          members={members}
          selfId={selfId}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}

function EntrySub({ entry }: { entry: ListEntry }) {
  const avg = entryAverage(entry);
  const t = entry.title;
  const hasExternal =
    (t.imdb_rating && t.imdb_rating > 0) ||
    (t.rt_rating && t.rt_rating > 0) ||
    (t.tmdb_rating && t.tmdb_rating > 0);

  return (
    <>
      {hasExternal && (
        <ScorePills
          imdb={t.imdb_rating}
          rt={t.rt_rating}
          tmdb={t.imdb_rating ? null : t.tmdb_rating}
        />
      )}
      {avg != null ? (
        <span className="ours">
          {avg.toFixed(1)} ★{entry.ratings.length > 1 ? " both" : ""}
        </span>
      ) : (
        !hasExternal && (
          <span>
            {entry.status === "watched"
              ? "Watched, not rated"
              : entry.status === "watching"
                ? "Watching now"
                : "On the watchlist"}
          </span>
        )
      )}
    </>
  );
}
