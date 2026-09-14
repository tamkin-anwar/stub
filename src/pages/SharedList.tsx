import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFriends, useSpaceActions, useSpaces } from "../hooks/social";
import { ListView } from "../components/ListView";
import { Avatar } from "../components/Avatar";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { GridSkeleton } from "../components/States";
import { displayName } from "../lib/format";
import { useToast } from "../components/Toast";
import type { SpaceWithMembers } from "../lib/types";

function NameEdit({
  space,
  busy,
  onSave,
}: {
  space: SpaceWithMembers;
  busy: boolean;
  onSave: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(space.name);

  if (!editing) {
    return (
      <button
        type="button"
        className="shared-name"
        onClick={() => {
          setValue(space.name);
          setEditing(true);
        }}
        title="Rename this list"
      >
        {space.name}
        <span className="pencil" aria-hidden>
          ✎
        </span>
      </button>
    );
  }

  const commit = () => {
    const next = value.trim();
    if (next && next !== space.name) onSave(next.slice(0, 60));
    setEditing(false);
  };

  return (
    <input
      className="shared-name-input"
      value={value}
      autoFocus
      maxLength={60}
      disabled={busy}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

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
  const [showCreate, setShowCreate] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addFriendId, setAddFriendId] = useState("");

  const acceptedFriends = (friends ?? []).filter((f) => f.direction === "friends");
  const current = useMemo(
    () => (spaces ?? []).find((s) => s.id === (activeSpaceId ?? spaces?.[0]?.id)) ?? null,
    [spaces, activeSpaceId],
  );

  // Friends you don't already keep a list with.
  const pairable = useMemo(() => {
    const paired = new Set((spaces ?? []).flatMap((s) => s.members.map((m) => m.id)));
    return acceptedFriends.filter((f) => !paired.has(f.profile.id));
  }, [acceptedFriends, spaces]);

  // Friends not already on this particular list, to grow it beyond a pair.
  const addable = useMemo(() => {
    if (!current) return [];
    const already = new Set(current.members.map((m) => m.id));
    return acceptedFriends.filter((f) => !already.has(f.profile.id));
  }, [acceptedFriends, current]);

  if (!profile) return null;

  const creating = showCreate || !current;

  async function createSpace() {
    if (!friendId) return;
    try {
      const id = await actions.create.mutateAsync({ friendId, name });
      setActiveSpaceId(id);
      setShowCreate(false);
      setFriendId("");
      toast("Shared list created");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create the list", { error: true });
    }
  }

  async function addMember() {
    if (!current || !addFriendId) return;
    const friend = addable.find((f) => f.profile.id === addFriendId)?.profile;
    try {
      await actions.addMember.mutateAsync({ spaceId: current.id, friendId: addFriendId });
      setShowAdd(false);
      setAddFriendId("");
      toast(friend ? `Added ${displayName(friend)} to the list` : "Added to the list");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add them", { error: true });
    }
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Shared</h1>
          <p className="page-sub">A list you keep together. Everyone on it adds titles and rates them.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {(spaces ?? []).length > 1 && !showCreate && (
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
          {current && !showCreate && pairable.length > 0 && (
            <button className="btn ghost sm" onClick={() => setShowCreate(true)}>
              New list
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <GridSkeleton count={8} />
      ) : creating ? (
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
          ) : pairable.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5 }}>
              You already share a list with everyone. <Link to="/app/friends">Add more friends</Link> to
              start another.
            </p>
          ) : (
            <>
              <div className="field">
                <label>Pair with</label>
                <select value={friendId} onChange={(e) => setFriendId(e.target.value)}>
                  <option value="">Choose a friend</option>
                  {pairable.map((f) => (
                    <option key={f.profile.id} value={f.profile.id}>
                      {displayName(f.profile)} (@{f.profile.username})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>List name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn primary"
                  disabled={!friendId || actions.create.isPending}
                  onClick={createSpace}
                >
                  Create shared list
                </button>
                {current && (
                  <button className="btn ghost" onClick={() => setShowCreate(false)}>
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        current && (
          <>
            <div className="shared-bar">
              <NameEdit
                space={current}
                busy={actions.rename.isPending}
                onSave={(next) =>
                  actions.rename.mutate(
                    { spaceId: current.id, name: next },
                    {
                      onError: (e) =>
                        toast(e instanceof Error ? e.message : "Could not rename", { error: true }),
                    },
                  )
                }
              />
              <div className="shared-members">
                {current.members.map((m) => (
                  <span key={m.id} className="shared-member">
                    <Avatar name={displayName(m)} accent={m.accent} avatarStyle={m.avatar_style} />
                    <span className="muted" style={{ fontSize: 13 }}>
                      {m.id === profile.id ? "You" : displayName(m)}
                    </span>
                  </span>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              {addable.length > 0 && !showAdd && (
                <button className="btn ghost sm" onClick={() => setShowAdd(true)}>
                  Add someone
                </button>
              )}
              <button className="btn ghost sm" onClick={() => setConfirmLeave(true)}>
                Leave
              </button>
            </div>

            {showAdd && (
              <div className="card" style={{ marginBottom: 18, maxWidth: 460 }}>
                <p className="eyebrow" style={{ marginBottom: 10 }}>Add someone to this list</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <select
                    value={addFriendId}
                    onChange={(e) => setAddFriendId(e.target.value)}
                    style={{ flex: 1, minWidth: 180 }}
                  >
                    <option value="">Choose a friend</option>
                    {addable.map((f) => (
                      <option key={f.profile.id} value={f.profile.id}>
                        {displayName(f.profile)} (@{f.profile.username})
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn primary sm"
                    disabled={!addFriendId || actions.addMember.isPending}
                    onClick={addMember}
                  >
                    Add
                  </button>
                  <button className="btn ghost sm" onClick={() => setShowAdd(false)}>
                    Cancel
                  </button>
                </div>
                <p className="tiny muted" style={{ marginTop: 8 }}>
                  They'll see every title, note and rating already on this list.
                </p>
              </div>
            )}

            <ListView
              owner={{ type: "space", id: current.id }}
              members={current.members}
              selfId={profile.id}
              emptyHint="Add titles from the Library, or open one and pick this list."
            />
          </>
        )
      )}

      {confirmLeave && current && (
        <ConfirmDialog
          title={`Leave "${current.name}"?`}
          body={
            current.members.length > 2
              ? "You will lose access to the shared list. The others keep it."
              : "You will lose access to the shared list. The other person keeps it."
          }
          confirmLabel="Leave"
          danger
          onConfirm={() =>
            actions.leave.mutate(current.id, {
              onError: (e) =>
                toast(e instanceof Error ? e.message : "Could not leave", { error: true }),
            })
          }
          onClose={() => setConfirmLeave(false)}
        />
      )}
    </div>
  );
}
