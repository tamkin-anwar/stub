import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePopularMovies } from "../hooks/library";
import { useMyEntryLookup } from "../hooks/lists";
import { useSpaces } from "../hooks/social";
import { ChartRow } from "../components/ChartRow";
import { GridSkeleton, LoadError } from "../components/States";
import { type AddTarget } from "../components/AddMenu";

export function Top100() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: movies, isLoading, isError, refetch } = usePopularMovies();
  const { data: spaces } = useSpaces(profile?.id);
  const mine = useMyEntryLookup(profile?.id);

  const targets = useMemo<AddTarget[]>(() => {
    if (!profile) return [];
    const t: AddTarget[] = [{ label: "My list", owner: { type: "user", id: profile.id } }];
    for (const s of spaces ?? []) t.push({ label: s.name, owner: { type: "space", id: s.id } });
    return t;
  }, [profile, spaces]);

  if (!profile) return null;

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Top 100</h1>
          <p className="page-sub">
            The 100 movies TMDB's own popularity score ranks highest right now — a live ranking, not a
            fixed list, so it moves as the world's attention does.
          </p>
        </div>
      </div>

      {isLoading ? (
        <GridSkeleton count={10} />
      ) : isError ? (
        <LoadError note="This chart did not load." onRetry={() => refetch()} />
      ) : (
        <div className="card">
          {(movies ?? []).map((r, i) => (
            <ChartRow
              key={`${r.mediaType}-${r.tmdbId}`}
              rank={i + 1}
              r={r}
              targets={targets}
              selfId={profile.id}
              mine={mine.get(`${r.mediaType}-${r.tmdbId}`) ?? null}
              onOpen={() => navigate(`/app/title/${r.mediaType}/${r.tmdbId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
