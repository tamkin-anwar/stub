import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { requireSupabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { Avatar } from "../components/Avatar";
import { displayName } from "../lib/format";

const ACCENTS = ["amber", "teal", "plum", "moss", "slate", "brick"];

export function Settings() {
  const { profile, user, refreshProfile, signOut } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [accent, setAccent] = useState(profile?.accent ?? "amber");
  const [busy, setBusy] = useState(false);

  if (!profile || !user) return null;

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

  return (
    <div className="wrap page" style={{ maxWidth: 560 }}>
      <div className="page-head">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Avatar name={displayName(profile)} accent={accent} size="lg" />
          <div>
            <div style={{ fontWeight: 600 }}>@{profile.username}</div>
            <div className="muted" style={{ fontSize: 13 }}>{user.email}</div>
          </div>
        </div>

        <div className="field">
          <label>Display name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label>Avatar colour</label>
          <div className="chips">
            {ACCENTS.map((a) => (
              <button key={a} className="chip" aria-pressed={accent === a} onClick={() => setAccent(a)}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <button className="btn primary" disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>

      <button className="btn" onClick={() => void signOut()}>
        Sign out
      </button>
    </div>
  );
}
