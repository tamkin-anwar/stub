import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ListStatus } from "../lib/types";
import type { ListOwner } from "../data/lists";
import { addToList, removeEntry, updateEntry } from "../data/lists";
import { entriesKey } from "../hooks/lists";
import { useToast } from "./Toast";

export interface AddTarget {
  label: string;
  owner: ListOwner;
}

/** The title's current place on the viewer's own list, when it is on it. */
export interface CurrentEntry {
  entryId: string;
  status: ListStatus;
}

const OPTIONS: { status: ListStatus; add: string; set: string }[] = [
  { status: "watchlist", add: "Add to watchlist", set: "Move to watchlist" },
  { status: "watching", add: "Mark as watching", set: "Mark as watching" },
  { status: "watched", add: "Mark as watched", set: "Mark as watched" },
];

const PILL: Record<ListStatus, string> = {
  watchlist: "On watchlist",
  watching: "Watching",
  watched: "Watched",
};

const MOVED: Record<ListStatus, string> = {
  watchlist: "Back on your watchlist",
  watching: "Marked as watching",
  watched: "Marked as watched",
};

export function AddMenu({
  media,
  targets,
  selfId,
  size = "sm",
  current = null,
}: {
  media: { tmdbId: number; mediaType: "movie" | "tv" };
  targets: AddTarget[];
  selfId: string;
  size?: "sm" | "md";
  /** Set when this title is already on the viewer's personal list. */
  current?: CurrentEntry | null;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const toast = useToast();
  const qc = useQueryClient();
  const target = targets[targetIndex] ?? targets[0];
  const selfOwner: ListOwner = { type: "user", id: selfId };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function run(work: () => Promise<void>, owner: ListOwner) {
    setBusy(true);
    try {
      await work();
      await qc.invalidateQueries({ queryKey: entriesKey(owner) });
      setOpen(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "That did not work", { error: true });
    } finally {
      setBusy(false);
    }
  }

  const add = (status: ListStatus) =>
    run(async () => {
      if (!target) return;
      const { created } = await addToList(target.owner, media, status, selfId);
      toast(created ? `Saved to ${target.label}` : `Already on ${target.label}`);
    }, target?.owner ?? selfOwner);

  const setStatus = (status: ListStatus) =>
    run(async () => {
      if (!current || current.status === status) return;
      await updateEntry(current.entryId, { status });
      toast(MOVED[status]);
    }, selfOwner);

  const removeFromList = () =>
    run(async () => {
      if (!current) return;
      await removeEntry(current.entryId);
      toast("Removed from your list");
    }, selfOwner);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        className={current ? `btn on-list ${size === "sm" ? "sm" : ""}` : `btn primary ${size === "sm" ? "sm" : ""}`}
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {current ? `${current.status === "watched" ? "✓ " : ""}${PILL[current.status]}` : "+ Add"}
      </button>
      {open && (
        <>
          <div
            className="add-menu-scrim"
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="card add-menu-pop"
            role="menu"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 41,
              width: 236,
              padding: 8,
              boxShadow: "var(--shadow)",
            }}
          >
            {!current && targets.length > 1 && (
              <select
                value={targetIndex}
                onChange={(e) => setTargetIndex(Number(e.target.value))}
                style={{ marginBottom: 6 }}
              >
                {targets.map((t, i) => (
                  <option key={t.label} value={i}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}

            {OPTIONS.map((o) => {
              const isCurrent = current?.status === o.status;
              return (
                <button
                  key={o.status}
                  className="btn ghost sm"
                  role="menuitem"
                  aria-current={isCurrent || undefined}
                  style={{ width: "100%", justifyContent: "flex-start", fontWeight: isCurrent ? 600 : undefined }}
                  disabled={busy || isCurrent}
                  onClick={() => (current ? void setStatus(o.status) : void add(o.status))}
                >
                  {isCurrent ? `✓ ${PILL[o.status]}` : current ? o.set : o.add}
                </button>
              );
            })}

            {current && (
              <button
                className="btn ghost sm danger"
                role="menuitem"
                style={{ width: "100%", justifyContent: "flex-start", marginTop: 4 }}
                disabled={busy}
                onClick={() => void removeFromList()}
              >
                Remove from list
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
