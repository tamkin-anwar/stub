import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { ListView } from "../components/ListView";
import { useEntries } from "../hooks/lists";

export function MyList() {
  const { profile } = useAuth();
  const owner = useMemo(
    () => (profile ? ({ type: "user", id: profile.id } as const) : null),
    [profile],
  );
  const { data: entries } = useEntries(owner);

  if (!profile || !owner) return null;

  const watched = (entries ?? []).filter((e) => e.status === "watched").length;
  const hours = Math.round(
    (entries ?? [])
      .filter((e) => e.status === "watched")
      .reduce((acc, e) => {
        const rt = e.title.runtime ?? 0;
        return acc + (e.title.media_type === "movie" ? rt : rt * 10);
      }, 0) / 60,
  );

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">My list</h1>
          <p className="page-sub">
            {entries ? `${watched} watched · about ${hours} hours logged` : "Your personal watch history"}
          </p>
        </div>
      </div>
      <ListView owner={owner} members={[profile]} selfId={profile.id} />
    </div>
  );
}
