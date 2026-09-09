import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFriends, useListCompare } from "../hooks/social";
import { PosterCard } from "../components/PosterCard";
import { EmptyState, GridSkeleton, LoadError } from "../components/States";
import { displayName } from "../lib/format";
import type { CompareBucket, CompareItem } from "../data/social";
import type { ListStatus } from "../lib/types";

type Filter = "all" | CompareBucket;

const SEEN: Record<ListStatus, string> = {
  watchlist: "watchlist",
  watching: "watching",
  watched: "seen",
};

function side(status: ListStatus | null, stars: number | null): string {
  if (!status) return "not on list";
  return stars ? `${SEEN[status]} · ${stars.toFixed(1)}★` : SEEN[status];
}

function CompareSub({ item, them }: { item: CompareItem; them: string }) {
  return (
    <>
      <span className="ours">You: {side(item.myStatus, item.myStars)}</span>
      <span>
        {them}: {side(item.theirStatus, item.theirStars)}
      </span>
    </>
  );
}

export function Compare() {
  const { friendId } = useParams<{ friendId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: friends } = useFriends(profile?.id);
  const compare = useListCompare(friendId);
  const [filter, setFilter] = useState<Filter>("all");

  const friend = (friends ?? []).find(
    (f) => f.profile.id === friendId && f.direction === "friends",
  );
  const them = friend ? displayName(friend.profile) : "them";

  const items = useMemo(() => compare.data ?? [], [compare.data]);
  const counts = useMemo(() => {
    const c = { both: 0, mine: 0, theirs: 0 };
    for (const i of items) c[i.bucket] += 1;
    return c;
  }, [items]);
  const bothSeen = useMemo(
    () =>
      items.filter(
        (i) => i.bucket === "both" && i.myStatus === "watched" && i.theirStatus === "watched",
      ).length,
    [items],
  );
  const shown = filter === "all" ? items : items.filter((i) => i.bucket === filter);

  if (!profile) return null;

  const tabs: [Filter, string][] = [
    ["all", "All"],
    ["both", `In common ${counts.both}`],
    ["mine", `Only yours ${counts.mine}`],
    ["theirs", `Only ${them} ${counts.theirs}`],
  ];

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <button
            className="btn ghost sm"
            style={{ marginBottom: 12 }}
            onClick={() => navigate("/app/friends")}
          >
            ← Friends
          </button>
          <h1 className="page-title">You and {friend ? displayName(friend.profile) : "a friend"}</h1>
          <p className="page-sub">
            {counts.both} on both lists
            {bothSeen > 0 ? ` · ${bothSeen} you have both seen` : ""}
          </p>
        </div>
      </div>

      {compare.isLoading ? (
        <GridSkeleton />
      ) : compare.error ? (
        <LoadError note="Could not compare your lists." onRetry={() => compare.refetch()} />
      ) : !items.length ? (
        <EmptyState
          title="Nothing to compare yet"
          hint="Once you both have titles on your lists, they line up here."
        />
      ) : (
        <>
          <div className="seg" style={{ marginBottom: 22, flexWrap: "wrap" }}>
            {tabs.map(([k, label]) => (
              <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)}>
                {label}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <EmptyState title="Nothing in this group" />
          ) : (
            <div className="grid">
              {shown.map((i) => (
                <PosterCard
                  key={`${i.mediaType}-${i.tmdbId}`}
                  name={i.name}
                  year={i.year}
                  posterPath={i.posterPath}
                  badge={
                    i.bucket === "both" &&
                    i.myStatus === "watched" &&
                    i.theirStatus === "watched"
                      ? "watched"
                      : null
                  }
                  sub={<CompareSub item={i} them={them} />}
                  onClick={() => navigate(`/app/title/${i.mediaType}/${i.tmdbId}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
