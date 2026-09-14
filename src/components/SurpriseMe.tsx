import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEntries, useMyEntryLookup } from "../hooks/lists";
import { useSpaces } from "../hooks/social";
import type { ListOwner } from "../data/lists";
import { browseTitles, type MediaFilter } from "../lib/tmdb";
import { pickRandom, randomPage } from "../lib/random";
import type { ListEntry, Profile, TmdbTitle } from "../lib/types";
import { DiscoverCard } from "./DiscoverCard";
import { PosterCard } from "./PosterCard";
import { ScorePills } from "./ScorePills";
import { EntrySheet } from "./EntrySheet";
import { type AddTarget } from "./AddMenu";

type SourceKey = "mine" | "space" | "discover";

type Pick =
  | { kind: "entry"; entry: ListEntry; owner: ListOwner; members: Profile[] }
  | { kind: "discover"; title: TmdbTitle };

const MEDIA_LABEL: Record<MediaFilter, string> = { all: "Either", movie: "Film", tv: "Series" };

/** A pick-something-for-me card for Home. Rolls a random title from a
 *  watchlist (yours or a shared one) or, for something new, TMDB's
 *  popular feed, filtered by film or series. */
export function SurpriseMe() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [openEntry, setOpenEntry] = useState<{
    entry: ListEntry;
    owner: ListOwner;
    members: Profile[];
  } | null>(null);

  if (!profile) return null;

  return (
    <>
      <div className="card surprise-card">
        <div className="surprise-copy">
          <span className="surprise-die" aria-hidden="true">
            🎲
          </span>
          <div>
            <h3 className="display" style={{ fontSize: 19, marginBottom: 2 }}>
              Not sure what to watch?
            </h3>
            <p className="muted" style={{ fontSize: 13.5 }}>
              Let Stub pick something for you.
            </p>
          </div>
        </div>
        <button className="btn primary sm" onClick={() => setOpen(true)}>
          Surprise me
        </button>
      </div>

      {open && (
        <SurpriseDialog
          profile={profile}
          onClose={() => setOpen(false)}
          onOpenEntry={(entry, owner, members) => {
            setOpen(false);
            setOpenEntry({ entry, owner, members });
          }}
        />
      )}

      {openEntry && (
        <EntrySheet
          entry={openEntry.entry}
          owner={openEntry.owner}
          members={openEntry.members}
          selfId={profile.id}
          onClose={() => setOpenEntry(null)}
        />
      )}
    </>
  );
}

function SurpriseDialog({
  profile,
  onClose,
  onOpenEntry,
}: {
  profile: Profile;
  onClose: () => void;
  onOpenEntry: (entry: ListEntry, owner: ListOwner, members: Profile[]) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const { data: spaces } = useSpaces(profile.id);
  const mine = useMyEntryLookup(profile.id);

  const personalOwner = useMemo<ListOwner>(() => ({ type: "user", id: profile.id }), [profile.id]);
  const { data: personalEntries, isLoading: loadingPersonal } = useEntries(personalOwner);

  const firstSpace = spaces?.[0] ?? null;
  const spaceOwner = useMemo<ListOwner | null>(
    () => (firstSpace ? { type: "space", id: firstSpace.id } : null),
    [firstSpace],
  );
  const { data: spaceEntries, isLoading: loadingSpace } = useEntries(spaceOwner);

  const targets = useMemo<AddTarget[]>(() => {
    const t: AddTarget[] = [{ label: "My list", owner: personalOwner }];
    for (const s of spaces ?? []) t.push({ label: s.name, owner: { type: "space", id: s.id } });
    return t;
  }, [personalOwner, spaces]);

  const [media, setMedia] = useState<MediaFilter>("all");
  const [source, setSource] = useState<SourceKey>("mine");
  const [pick, setPick] = useState<Pick | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollFailed, setRollFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  function close() {
    ref.current?.close();
    onClose();
  }

  const sources: { key: SourceKey; label: string }[] = [
    { key: "mine", label: "My watchlist" },
    ...(firstSpace ? [{ key: "space" as const, label: firstSpace.name }] : []),
    { key: "discover", label: "Something new" },
  ];

  function watchlistPool(entries: ListEntry[] | undefined): ListEntry[] {
    return (entries ?? []).filter(
      (e) => e.status === "watchlist" && (media === "all" || e.title.media_type === media),
    );
  }

  const pool =
    source === "mine"
      ? watchlistPool(personalEntries)
      : source === "space"
        ? watchlistPool(spaceEntries)
        : null;
  const poolLoading = source === "mine" ? loadingPersonal : source === "space" ? loadingSpace : false;
  const emptyPool = pool !== null && !poolLoading && pool.length === 0;

  async function roll() {
    setRollFailed(false);
    if (source === "discover") {
      setRolling(true);
      try {
        const page = randomPage(20);
        const { items } = await browseTitles({ feed: "popular", media, page });
        const fresh = items.filter((i) => !mine.has(`${i.mediaType}-${i.tmdbId}`));
        const picked = pickRandom(fresh.length ? fresh : items);
        if (!picked) {
          setRollFailed(true);
          setPick(null);
        } else {
          setPick({ kind: "discover", title: picked });
        }
      } catch {
        setRollFailed(true);
        setPick(null);
      } finally {
        setRolling(false);
      }
      return;
    }

    const owner = source === "mine" ? personalOwner : spaceOwner;
    const members = source === "mine" ? [profile] : (firstSpace?.members ?? []);
    const picked = pickRandom(pool ?? []);
    if (!picked || !owner) {
      setPick(null);
      return;
    }
    setPick({ kind: "entry", entry: picked, owner, members });
  }

  function chooseMedia(m: MediaFilter) {
    setMedia(m);
    setPick(null);
    setRollFailed(false);
  }
  function chooseSource(s: SourceKey) {
    setSource(s);
    setPick(null);
    setRollFailed(false);
  }

  return (
    <dialog
      ref={ref}
      className="surprise-dialog"
      onCancel={close}
      onClick={(e) => e.target === ref.current && close()}
    >
      <div style={{ padding: 22 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <h2 className="display" style={{ fontSize: 22 }}>
            Surprise me
          </h2>
          <button className="btn ghost sm" onClick={close}>
            Close
          </button>
        </div>

        <div className="field">
          <label>Type</label>
          <div className="seg">
            {(["all", "movie", "tv"] as MediaFilter[]).map((m) => (
              <button key={m} aria-pressed={media === m} onClick={() => chooseMedia(m)}>
                {MEDIA_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>From</label>
          <div className="seg">
            {sources.map((s) => (
              <button key={s.key} aria-pressed={source === s.key} onClick={() => chooseSource(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="surprise-result">
          {rolling ? (
            <div className="skel skel-poster" style={{ width: 150, margin: "0 auto" }} />
          ) : emptyPool ? (
            <p className="muted" style={{ fontSize: 13.5, textAlign: "center", padding: "24px 0" }}>
              Nothing on {sources.find((s) => s.key === source)?.label.toLowerCase()} for that type
              yet. Try "Something new" instead.
            </p>
          ) : rollFailed ? (
            <p className="muted" style={{ fontSize: 13.5, textAlign: "center", padding: "24px 0" }}>
              Could not reach TMDB just now. Try again.
            </p>
          ) : pick?.kind === "discover" ? (
            <div style={{ maxWidth: 150, margin: "0 auto" }}>
              <DiscoverCard
                r={pick.title}
                targets={targets}
                selfId={profile.id}
                mine={mine.get(`${pick.title.mediaType}-${pick.title.tmdbId}`) ?? null}
                onOpen={() => {
                  close();
                  navigate(`/app/title/${pick.title.mediaType}/${pick.title.tmdbId}`);
                }}
              />
            </div>
          ) : pick?.kind === "entry" ? (
            <div style={{ maxWidth: 150, margin: "0 auto" }}>
              <PosterCard
                name={pick.entry.title.name}
                year={pick.entry.title.year}
                posterPath={pick.entry.title.poster_path}
                badge={
                  pick.entry.status === "watched"
                    ? "watched"
                    : pick.entry.status === "watching"
                      ? "watching"
                      : null
                }
                sub={
                  <ScorePills
                    imdb={pick.entry.title.imdb_rating}
                    rt={pick.entry.title.rt_rating}
                    metacritic={pick.entry.title.metacritic}
                    tmdb={pick.entry.title.tmdb_rating}
                    imdbId={pick.entry.title.imdb_id}
                  />
                }
                onClick={() => onOpenEntry(pick.entry, pick.owner, pick.members)}
              />
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 13.5, textAlign: "center", padding: "24px 0" }}>
              Pick a type and a list, then roll.
            </p>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <button className="btn primary" disabled={rolling || emptyPool} onClick={() => void roll()}>
            {rolling ? "Rolling…" : pick ? "🎲 Try another" : "🎲 Surprise me"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
