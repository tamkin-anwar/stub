import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../hooks/lists";
import { requireSupabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { Avatar } from "../components/Avatar";
import { displayName, entryAverage, ratingFor } from "../lib/format";
import { getTheme, setTheme, type Theme } from "../lib/theme";

const ACCENTS: { key: string; hex: string }[] = [
  { key: "amber", hex: "#c9822f" },
  { key: "teal", hex: "#2f8f8f" },
  { key: "plum", hex: "#7a4b8f" },
  { key: "moss", hex: "#5c7a3f" },
  { key: "slate", hex: "#4d6072" },
  { key: "brick", hex: "#a5482f" },
];

const THEMES: { key: Theme; label: string }[] = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

export function Settings() {
  const { profile, user, refreshProfile, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const owner = useMemo(
    () => (profile ? ({ type: "user", id: profile.id } as const) : null),
    [profile],
  );
  const { data: entries } = useEntries(owner);

  const [name, setName] = useState(profile?.display_name ?? "");
  const [accent, setAccent] = useState(profile?.accent ?? "amber");
  const [theme, setThemeState] = useState<Theme>(getTheme());
  const [busy, setBusy] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  if (!profile || !user) return null;

  const dirty =
    name.trim() !== (profile.display_name ?? "").trim() || accent !== (profile.accent ?? "amber");

  const titles = entries?.length ?? 0;
  const rated = (entries ?? []).filter((e) => ratingFor(e, profile.id) != null).length;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  async function save() {
    setBusy(true);
    try {
      const sb = requireSupabase();
      const { error } = await sb
        .from("profiles")
        .update({ display_name: name.trim(), accent })
        .eq("id", profile!.id);
      if (error) throw error;
      await refreshProfile();
      toast("Saved");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  function chooseTheme(t: Theme) {
    setTheme(t);
    setThemeState(t);
  }

  function exportList() {
    const rows = (entries ?? []).map((e) => ({
      title: e.title.name,
      year: e.title.year,
      type: e.title.media_type === "movie" ? "film" : "series",
      status: e.status,
      watched_on: e.watched_on ?? null,
      your_rating: ratingFor(e, profile!.id),
      average_rating: entryAverage(e),
      note: e.note || null,
      tmdb_id: e.title.tmdb_id,
      imdb_id: e.title.imdb_id ?? null,
      added_at: e.created_at,
    }));
    const payload = {
      exported_at: new Date().toISOString(),
      account: profile!.username,
      count: rows.length,
      titles: rows,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `stub-${profile!.username}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="wrap page" style={{ maxWidth: 620 }}>
      <div className="page-head">
        <h1 className="page-title">Settings</h1>
      </div>

      <section className="settings-group">
        <p className="eyebrow">Profile</p>
        <div className="card">
          <div className="settings-identity">
            <Avatar name={displayName({ display_name: name, username: profile.username })} accent={accent} size="lg" />
            <div>
              <div className="settings-handle">@{profile.username}</div>
              <div className="muted" style={{ fontSize: 13 }}>{user.email}</div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="settings-name">Display name</label>
            <input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
          </div>

          <div className="field" style={{ marginBottom: 4 }}>
            <label>Avatar colour</label>
            <div className="swatches">
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className="swatch"
                  aria-pressed={accent === a.key}
                  aria-label={a.key}
                  title={a.key}
                  style={{ background: a.hex }}
                  onClick={() => setAccent(a.key)}
                />
              ))}
            </div>
          </div>

          <button className="btn primary" disabled={busy || !dirty} onClick={save}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </section>

      <section className="settings-group">
        <p className="eyebrow">Appearance</p>
        <div className="card">
          <div className="settings-row">
            <div>
              <div className="settings-row-title">Theme</div>
              <div className="muted tiny">System follows your device.</div>
            </div>
            <div className="seg">
              {THEMES.map((t) => (
                <button key={t.key} aria-pressed={theme === t.key} onClick={() => chooseTheme(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="settings-group">
        <p className="eyebrow">Your data</p>
        <div className="card">
          <div className="settings-row">
            <div>
              <div className="settings-row-title">Export your list</div>
              <div className="muted tiny">
                {titles} {titles === 1 ? "title" : "titles"}, {rated} rated. Downloads as JSON.
              </div>
            </div>
            <button className="btn sm" onClick={exportList} disabled={titles === 0}>
              Export
            </button>
          </div>
        </div>
      </section>

      <section className="settings-group">
        <p className="eyebrow">Account</p>
        <div className="card">
          <div className="settings-kv">
            <span>Username</span>
            <span className="mono">@{profile.username}</span>
          </div>
          <div className="settings-kv">
            <span>Email</span>
            <span className="mono">{user.email}</span>
          </div>
          <div className="settings-kv">
            <span>Member since</span>
            <span className="mono">{memberSince}</span>
          </div>
          <div className="settings-row settings-row-divide">
            <div>
              <div className="settings-row-title">Sign out</div>
              <div className="muted tiny">End this session on this device.</div>
            </div>
            <button className="btn sm" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="settings-group">
        <p className="eyebrow danger-label">Danger zone</p>
        <div className="card danger-card">
          <div className="settings-row">
            <div>
              <div className="settings-row-title">Delete account</div>
              <div className="muted tiny">
                Erases your profile, lists, ratings and sign-in. This cannot be undone.
              </div>
            </div>
            <button className="btn sm danger-btn" onClick={() => setDelOpen(true)}>
              Delete…
            </button>
          </div>
        </div>
      </section>

      {delOpen && (
        <DeleteDialog
          username={profile.username}
          onClose={() => setDelOpen(false)}
          onConfirmed={async () => {
            try {
              const sb = requireSupabase();
              const { error } = await sb.rpc("delete_own_account");
              if (error) throw error;
              await signOut();
              navigate("/", { replace: true });
            } catch (err) {
              toast(err instanceof Error ? err.message : "Could not delete account");
            }
          }}
        />
      )}
    </div>
  );
}

function DeleteDialog({
  username,
  onClose,
  onConfirmed,
}: {
  username: string;
  onClose: () => void;
  onConfirmed: () => Promise<void>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  function close() {
    ref.current?.close();
    onClose();
  }

  return (
    <dialog ref={ref} onCancel={close} onClick={(e) => e.target === ref.current && close()}>
      <div style={{ padding: 22 }}>
        <h2 className="display" style={{ fontSize: 22, marginBottom: 8 }}>
          Delete your account
        </h2>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, marginBottom: 16 }}>
          Everything tied to <strong>@{username}</strong> goes: your lists, ratings, notes, friends
          and sign-in. There is no undo.
        </p>
        <div className="field">
          <label htmlFor="delete-confirm">
            Type <span className="mono">{username}</span> to confirm
          </label>
          <input
            id="delete-confirm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn sm" onClick={close}>
            Cancel
          </button>
          <button
            className="btn sm danger-btn"
            disabled={text !== username || busy}
            onClick={async () => {
              setBusy(true);
              await onConfirmed();
              setBusy(false);
            }}
          >
            {busy ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
