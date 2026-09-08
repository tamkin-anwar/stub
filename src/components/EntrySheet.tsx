import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ListEntry, ListStatus, Profile } from "../lib/types";
import type { ListOwner } from "../data/lists";
import { useRemoveEntry, useSetRating, useUpdateEntry } from "../hooks/lists";
import { posterUrl } from "../lib/tmdb";
import { displayName, entryAverage, posterGradient, ratingFor, runtimeLabel } from "../lib/format";
import { Stars } from "./Stars";
import { ScorePills } from "./ScorePills";

const STATUSES: ListStatus[] = ["watchlist", "watching", "watched"];
const STATUS_TEXT: Record<ListStatus, string> = {
  watchlist: "Watchlist",
  watching: "Watching",
  watched: "Watched",
};

interface Props {
  entry: ListEntry;
  owner: ListOwner;
  members: Profile[];
  selfId: string;
  onClose: () => void;
}

export function EntrySheet({ entry, owner, members, selfId, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const update = useUpdateEntry(owner);
  const remove = useRemoveEntry(owner);
  const rate = useSetRating(owner, selfId);

  const [note, setNote] = useState(entry.note);
  const [status, setStatus] = useState<ListStatus>(entry.status);
  const [watchedOn, setWatchedOn] = useState(entry.watched_on ?? "");

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  function close() {
    if (note !== entry.note) update.mutate({ entryId: entry.id, patch: { note } });
    ref.current?.close();
    onClose();
  }

  function changeStatus(next: ListStatus) {
    setStatus(next);
    const patch: Partial<Pick<ListEntry, "status" | "watched_on">> = { status: next };
    if (next === "watched" && !watchedOn) {
      const m = new Date().toISOString().slice(0, 10);
      setWatchedOn(m);
      patch.watched_on = m;
    }
    update.mutate({ entryId: entry.id, patch });
  }

  const g = posterGradient(entry.title.name);
  const poster = posterUrl(entry.title.poster_path, "w342");
  const avg = entryAverage(entry);

  return (
    <dialog ref={ref} onCancel={close} onClick={(e) => e.target === ref.current && close()}>
      <div className="detail-grid" style={{ padding: 22, gridTemplateColumns: "150px 1fr", gap: 20 }}>
        <div>
          <div className="poster" style={{ marginBottom: 10 }}>
            {poster ? (
              <img src={poster} alt={entry.title.name} />
            ) : (
              <div className="fallback" style={{ ["--d" as string]: g.d, ["--m" as string]: g.m }}>
                <span className="ftitle">{entry.title.name}</span>
              </div>
            )}
          </div>
          <button className="btn sm" style={{ width: "100%" }} onClick={() => {
            close();
            navigate(`/app/title/${entry.title.media_type}/${entry.title.tmdb_id}`);
          }}>
            Open title page
          </button>
        </div>

        <div>
          <h2 className="display" style={{ fontSize: 27 }}>
            {entry.title.name}
          </h2>
          <div className="page-sub" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span>
              {entry.title.year ?? "TBA"} · {entry.title.media_type === "movie" ? "Film" : "Series"}
              {runtimeLabel(entry.title.runtime, entry.title.media_type)
                ? ` · ${runtimeLabel(entry.title.runtime, entry.title.media_type)}`
                : ""}
            </span>
            <ScorePills tmdb={entry.title.tmdb_rating} imdbId={entry.title.imdb_id} />
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Status</label>
            <div className="seg">
              {STATUSES.map((s) => (
                <button key={s} aria-pressed={status === s} onClick={() => changeStatus(s)}>
                  {STATUS_TEXT[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>{members.length > 1 ? "Ratings" : "Your rating"}</label>
            {members.map((m) => {
              const mine = m.id === selfId;
              return (
                <div
                  key={m.id}
                  style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0" }}
                >
                  <span style={{ width: 92, fontSize: 13, fontWeight: 600 }}>
                    {mine ? "You" : displayName(m)}
                  </span>
                  <Stars
                    value={ratingFor(entry, m.id)}
                    readOnly={!mine}
                    onChange={
                      mine
                        ? (next) => {
                            rate.mutate({ entryId: entry.id, stars: next });
                            if (next && status !== "watched") changeStatus("watched");
                          }
                        : undefined
                    }
                  />
                  <span className="muted" style={{ fontSize: 12 }}>
                    {ratingFor(entry, m.id)?.toFixed(1) ?? ""}
                  </span>
                </div>
              );
            })}
            {members.length > 1 && avg != null && (
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Average {avg.toFixed(1)}
              </div>
            )}
          </div>

          <div className="field">
            <label>Watched on</label>
            <input
              type="month"
              value={watchedOn ? watchedOn.slice(0, 7) : ""}
              onChange={(e) => {
                const v = e.target.value ? `${e.target.value}-01` : "";
                setWatchedOn(v);
                update.mutate({ entryId: entry.id, patch: { watched_on: v || null } });
              }}
            />
          </div>

          <div className="field">
            <label>Notes</label>
            <textarea
              value={note}
              placeholder="What did you think?"
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => note !== entry.note && update.mutate({ entryId: entry.id, patch: { note } })}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              className="btn danger sm"
              onClick={() => {
                if (confirm(`Remove "${entry.title.name}" from this list?`)) {
                  remove.mutate(entry.id, { onSuccess: () => { ref.current?.close(); onClose(); } });
                }
              }}
            >
              Remove
            </button>
            <div style={{ flex: 1 }} />
            <button className="btn primary sm" onClick={close}>
              Done
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
