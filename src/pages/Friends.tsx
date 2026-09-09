import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useFriendActions,
  useFriends,
  useProfileSearch,
  useSpaceActions,
  useSpaces,
} from "../hooks/social";
import { Avatar } from "../components/Avatar";
import { displayName } from "../lib/format";
import { useToast } from "../components/Toast";

export function Friends() {
  const { profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const { data: friends } = useFriends(profile?.id);
  const { data: found } = useProfileSearch(term, profile?.id);
  const { data: spaces } = useSpaces(profile?.id);
  const actions = useFriendActions(profile?.id ?? "");
  const spaceActions = useSpaceActions(profile?.id ?? "");

  const fail = (err: unknown) =>
    toast(err instanceof Error ? err.message : "Something went wrong", { error: true });

  if (!profile) return null;

  const sharedWith = new Set(
    (spaces ?? []).flatMap((s) => s.members.map((m) => m.id)),
  );

  function startList(friend: { id: string; display_name: string; username: string }) {
    spaceActions.create.mutate(
      { friendId: friend.id, name: `${displayName(friend)} & you` },
      {
        onSuccess: () => {
          toast("Shared list created");
          navigate("/app/shared");
        },
        onError: fail,
      },
    );
  }

  const incoming = (friends ?? []).filter((f) => f.direction === "incoming");
  const outgoing = (friends ?? []).filter((f) => f.direction === "outgoing");
  const accepted = (friends ?? []).filter((f) => f.direction === "friends");
  const knownIds = new Set((friends ?? []).map((f) => f.profile.id));

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Friends</h1>
          <p className="page-sub">Find people by username, then pair up for a shared list.</p>
        </div>
      </div>

      <div className="search-box" style={{ maxWidth: 420, marginBottom: 22 }}>
        <input
          placeholder="Search by @username or name"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>

      {term.trim().length >= 2 && (
        <section style={{ marginBottom: 28 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Results</p>
          <div className="card">
            {(found ?? []).length === 0 ? (
              <p className="muted" style={{ fontSize: 13.5, padding: "6px 4px" }}>No one found.</p>
            ) : (
              (found ?? []).map((p) => (
                <div className="row" key={p.id}>
                  <Avatar name={displayName(p)} accent={p.accent} />
                  <div className="grow">
                    <div className="name">{displayName(p)}</div>
                    <div className="handle">@{p.username}</div>
                  </div>
                  {knownIds.has(p.id) ? (
                    <span className="muted" style={{ fontSize: 12.5 }}>Pending or friends</span>
                  ) : (
                    <button
                      className="btn sm"
                      onClick={() =>
                        actions.request.mutate(p.id, { onSuccess: () => toast("Request sent"), onError: fail })
                      }
                    >
                      Add friend
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {incoming.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Requests</p>
          <div className="card">
            {incoming.map((f) => (
              <div className="row" key={f.friendship.id}>
                <Avatar name={displayName(f.profile)} accent={f.profile.accent} />
                <div className="grow">
                  <div className="name">{displayName(f.profile)}</div>
                  <div className="handle">@{f.profile.username}</div>
                </div>
                <button className="btn primary sm" onClick={() => actions.accept.mutate(f.friendship.id, { onError: fail })}>
                  Accept
                </button>
                <button className="btn ghost sm" onClick={() => actions.remove.mutate(f.friendship.id, { onError: fail })}>
                  Ignore
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          Friends {accepted.length > 0 ? `(${accepted.length})` : ""}
        </p>
        <div className="card">
          {accepted.length === 0 && outgoing.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5, padding: "6px 4px" }}>
              No friends yet. Search by username above to send your first request.
            </p>
          ) : (
            <>
              {accepted.map((f) => (
                <div className="row" key={f.friendship.id}>
                  <Avatar name={displayName(f.profile)} accent={f.profile.accent} />
                  <div className="grow">
                    <div className="name">{displayName(f.profile)}</div>
                    <div className="handle">@{f.profile.username}</div>
                  </div>
                  {sharedWith.has(f.profile.id) ? (
                    <Link to="/app/shared" className="btn ghost sm">
                      Shared list
                    </Link>
                  ) : (
                    <button
                      className="btn ghost sm"
                      disabled={spaceActions.create.isPending}
                      onClick={() => startList(f.profile)}
                    >
                      Start list
                    </button>
                  )}
                  <Link to={`/app/compare/${f.profile.id}`} className="btn ghost sm">
                    Compare
                  </Link>
                  <button className="btn ghost sm" onClick={() => actions.remove.mutate(f.friendship.id, { onError: fail })}>
                    Remove
                  </button>
                </div>
              ))}
              {outgoing.map((f) => (
                <div className="row" key={f.friendship.id}>
                  <Avatar name={displayName(f.profile)} accent={f.profile.accent} />
                  <div className="grow">
                    <div className="name">{displayName(f.profile)}</div>
                    <div className="handle">@{f.profile.username}</div>
                  </div>
                  <span className="muted" style={{ fontSize: 12.5 }}>Requested</span>
                  <button className="btn ghost sm" onClick={() => actions.remove.mutate(f.friendship.id, { onError: fail })}>
                    Cancel
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
