import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { ListEntry, ListStatus, Profile } from "../lib/types";
import type { ListOwner } from "../data/lists";
import { moveEntry, updateEntry } from "../data/lists";
import { entriesKey, useRemoveEntry, useSetRating, useUpdateEntry } from "../hooks/lists";
import { useSpaces } from "../hooks/social";
import { posterUrl } from "../lib/tmdb";
import { displayName, entryAverage, posterGradient, ratingFor, runtimeLabel } from "../lib/format";
import { Stars } from "./Stars";
import { ScorePills } from "./ScorePills";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

interface Destination {
  label: string;
  owner: ListOwner;
}

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
  const qc = useQueryClient();
  const toast = useToast();
  const update = useUpdateEntry(owner);
  const remove = useRemoveEntry(owner);
  const rate = useSetRating(owner, selfId);
  const { data: spaces } = useSpaces(selfId);

  const [note, setNote] = useState(entry.note);
  const [status, setStatus] = useState<ListStatus>(entry.status);
  const [watchedOn, setWatchedOn] = useState(entry.watched_on ?? "");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [destIndex, setDestIndex] = useState(0);
  const [moving, setMoving] = useState(false);
  const [confirmMoveOut, setConfirmMoveOut] = useState<Destination | null>(null);

  const destinations = useMemo<Destination[]>(() => {
    const all: Destination[] = [
      { label: "My list", owner: { type: "user" as const, id: selfId } },
      ...(spaces ?? []).map((s) => ({
        label: s.name,
        owner: { type: "space" as const, id: s.id },
      })),
    ];
    return all.filter((d) => !(d.owner.type === owner.type && d.owner.id === owner.id));
  }, [spaces, selfId, owner]);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  async function doMove(dest: Destination) {
    setConfirmMoveOut(null);
    setMoving(true);
    try {
      if (note !== entry.note) await updateEntry(entry.id, { note });
      const { moved } = await moveEntry(entry.id, dest.owner);
      if (!moved) {
        toast(`${entry.title.name} is already on ${dest.label}`, { error: true });
        setMoving(false);
        return;
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: entriesKey(owner) }),
        qc.invalidateQueries({ queryKey: entriesKey(dest.owner) }),
      ]);
      toast(`Moved to ${dest.label}`);
      ref.current?.close();
      onClose();
    } catch {
      toast("Could not move it", { error: true });
      setMoving(false);
    }
  }

  function requestMove(dest: Destination) {
    if (owner.type === "space") setConfirmMoveOut(dest);
    else void doMove(dest);
  }

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
    <>
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
            <ScorePills
              imdb={entry.title.imdb_rating}
              rt={entry.title.rt_rating}
              metacritic={entry.title.metacritic}
              tmdb={entry.title.tmdb_rating}
              imdbId={entry.title.imdb_id}
            />
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
            <label htmlFor={`watched-${entry.id}`}>Watched on</label>
            <input
              id={`watched-${entry.id}`}
              type="date"
              value={watchedOn || ""}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                const v = e.target.value || "";
                setWatchedOn(v);
                update.mutate({ entryId: entry.id, patch: { watched_on: v || null } });
              }}
            />
          </div>

          <div className="field">
            <label htmlFor={`note-${entry.id}`}>
              {owner.type === "space" ? "Shared note" : "Notes"}
            </label>
            <textarea
              id={`note-${entry.id}`}
              value={note}
              placeholder="What did you think?"
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => note !== entry.note && update.mutate({ entryId: entry.id, patch: { note } })}
            />
            <p className="tiny muted" style={{ marginTop: 4 }}>
              {owner.type === "space" ? "Both of you can see and edit this." : "Private to you."}
            </p>
          </div>

          {destinations.length > 0 && (
            <div className="field">
              <label htmlFor={`move-${entry.id}`}>Move to</label>
              {destinations.length === 1 ? (
                <button
                  id={`move-${entry.id}`}
                  className="btn sm"
                  disabled={moving}
                  onClick={() => requestMove(destinations[0])}
                >
                  Move to {destinations[0].label}
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    id={`move-${entry.id}`}
                    value={destIndex}
                    onChange={(e) => setDestIndex(Number(e.target.value))}
                  >
                    {destinations.map((d, i) => (
                      <option key={`${d.owner.type}-${d.owner.id}`} value={i}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn sm"
                    disabled={moving}
                    onClick={() => requestMove(destinations[destIndex])}
                  >
                    Move
                  </button>
                </div>
              )}
              <p className="tiny muted" style={{ marginTop: 4 }}>
                Status, dates, notes and ratings move with it.
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn danger sm" onClick={() => setConfirmRemove(true)}>
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

    {confirmRemove && (
      <ConfirmDialog
        title="Remove this title?"
        body={`"${entry.title.name}" will be taken off this list.`}
        confirmLabel="Remove"
        danger
        onConfirm={() =>
          remove.mutate(entry.id, {
            onSuccess: () => {
              ref.current?.close();
              onClose();
            },
          })
        }
        onClose={() => setConfirmRemove(false)}
      />
    )}

    {confirmMoveOut && (
      <ConfirmDialog
        title={`Move "${entry.title.name}" to ${confirmMoveOut.label}?`}
        body={`It comes off the list you share with ${
          members
            .filter((m) => m.id !== selfId)
            .map((m) => displayName(m))
            .join(" and ") || "the other person"
        }.`}
        confirmLabel="Move"
        onConfirm={() => void doMove(confirmMoveOut)}
        onClose={() => setConfirmMoveOut(null)}
      />
    )}
    </>
  );
}
