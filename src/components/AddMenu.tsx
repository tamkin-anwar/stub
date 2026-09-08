import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ListStatus } from "../lib/types";
import type { ListOwner } from "../data/lists";
import { addToList } from "../data/lists";
import { entriesKey } from "../hooks/lists";
import { useToast } from "./Toast";

export interface AddTarget {
  label: string;
  owner: ListOwner;
}

const OPTIONS: { status: ListStatus; label: string }[] = [
  { status: "watchlist", label: "Add to watchlist" },
  { status: "watching", label: "Mark as watching" },
  { status: "watched", label: "Mark as watched" },
];

export function AddMenu({
  media,
  targets,
  selfId,
  size = "sm",
}: {
  media: { tmdbId: number; mediaType: "movie" | "tv" };
  targets: AddTarget[];
  selfId: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const toast = useToast();
  const qc = useQueryClient();
  const target = targets[targetIndex] ?? targets[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function add(status: ListStatus) {
    if (!target) return;
    setBusy(true);
    try {
      await addToList(target.owner, media, status, selfId);
      await qc.invalidateQueries({ queryKey: entriesKey(target.owner) });
      toast(`Saved to ${target.label}`);
      setOpen(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add", { error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        className={`btn primary ${size === "sm" ? "sm" : ""}`}
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
      >
        + Add
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
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 41,
              width: 230,
              padding: 8,
              boxShadow: "var(--shadow)",
            }}
          >
            {targets.length > 1 && (
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
            {OPTIONS.map((o) => (
              <button
                key={o.status}
                className="btn ghost sm"
                style={{ width: "100%", justifyContent: "flex-start" }}
                disabled={busy}
                onClick={() => void add(o.status)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
