import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFriends, useSpaceActions, useSpaces } from "../hooks/social";
import { ListView } from "../components/ListView";
import { Avatar } from "../components/Avatar";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { displayName } from "../lib/format";
import { useToast } from "../components/Toast";

export function SharedList() {
  const { profile } = useAuth();
  const { data: spaces, isLoading } = useSpaces(profile?.id);
  const { data: friends } = useFriends(profile?.id);
  const actions = useSpaceActions(profile?.id ?? "");
  const toast = useToast();
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [name, setName] = useState("Our list");
  const [friendId, setFriendId] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);

  const acceptedFriends = (friends ?? []).filter((f) => f.direction === "friends");
  const current = useMemo(
    () => (spaces ?? []).find((s) => s.id === (activeSpaceId ?? spaces?.[0]?.id)) ?? null,
    [spaces, activeSpaceId],
  );

  if (!profile) return null;

  async function createSpace() {
    if (!friendId) return;
    try {
      const id = await actions.create.mutateAsync({ friendId, name });
      setActiveSpaceId(id);
      toast("Shared list created");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create the list", { error: true });
    }
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Shared</h1>
          <p className="page-sub">A list you keep together. Both of you add titles and rate them.</p>
        </div>
        {(spaces ?? []).length > 1 && (
          <select
            style={{ width: "auto" }}
            value={current?.id ?? ""}
            onChange={(e) => setActiveSpaceId(e.target.value)}
          >
            {(spaces ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <p className="center-note">Loading…</p>
      ) : current ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            {current.members.map((m) => (
              <span key={m.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Avatar name={displayName(m)} accent={m.accent} />
                <span className="muted" style={{ fontSize: 13 }}>
                  {m.id === profile.id ? "You" : displayName(m)}
                </span>
              </span>
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn ghost sm" onClick={() => setConfirmLeave(true)}>
              Leave
            </button>
          </div>
          <ListView
            owner={{ type: "space", id: current.id }}
            members={current.members}
            selfId={profile.id}
            emptyHint="Add titles from the Library, or open one and pick this list."
          />
        </>
      ) : (
        <div className="card" style={{ maxWidth: 460 }}>
          <h3 className="display" style={{ fontSize: 23, marginBottom: 8 }}>
            Start a shared list
          </h3>
          <p className="muted" style={{ fontSize: 13.5, marginBottom: 14 }}>
            Pair with a friend to keep one list together while you each still keep your own.
          </p>
          {acceptedFriends.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5 }}>
              You need a friend first. <Link to="/app/friends">Find people</Link>.
            </p>
          ) : (
            <>
              <div className="field">
                <label>Pair with</label>
                <select value={friendId} onChange={(e) => setFriendId(e.target.value)}>
                  <option value="">Choose a friend</option>
                  {acceptedFriends.map((f) => (
                    <option key={f.profile.id} value={f.profile.id}>
                      {displayName(f.profile)} (@{f.profile.username})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>List name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <button className="btn primary" disabled={!friendId || actions.create.isPending} onClick={createSpace}>
                Create shared list
              </button>
            </>
          )}
        </div>
      )}

      {confirmLeave && current && (
        <ConfirmDialog
          title={`Leave "${current.name}"?`}
          body="You will lose access to the shared list. The other person keeps it."
          confirmLabel="Leave"
          danger
          onConfirm={() => actions.leave.mutate(current.id, { onError: (e) => toast(e instanceof Error ? e.message : "Could not leave", { error: true }) })}
          onClose={() => setConfirmLeave(false)}
        />
      )}
    </div>
  );
}
