import { useCardScores } from "../hooks/library";
import { posterUrl } from "../lib/tmdb";
import { AddMenu, type AddTarget, type CurrentEntry } from "./AddMenu";
import type { TmdbTitle } from "../lib/types";

export function ChartRow({
  rank,
  r,
  targets,
  selfId,
  mine,
  onOpen,
}: {
  rank: number;
  r: TmdbTitle;
  targets: AddTarget[];
  selfId: string;
  mine: CurrentEntry | null;
  onOpen: () => void;
}) {
  const cs = useCardScores(r.mediaType, r.tmdbId, true);
  const hasImdb = typeof cs.data?.imdb === "number" && cs.data.imdb > 0;
  const poster = posterUrl(r.posterPath, "w185");

  return (
    <div className="row chart-row">
      <span className="chart-rank">{rank}</span>
      <button type="button" className="chart-open" onClick={onOpen}>
        {poster ? (
          <img className="activity-thumb" src={poster} alt="" loading="lazy" />
        ) : (
          <span className="activity-thumb" style={{ display: "block", background: "var(--surface-2)" }} />
        )}
        <span className="grow">
          <div className="name">{r.name}</div>
          <div className="handle">
            {r.year ?? "TBA"}
            {hasImdb ? ` · IMDb ${cs.data!.imdb!.toFixed(1)}` : r.voteAverage ? ` · TMDB ${r.voteAverage.toFixed(1)}` : ""}
          </div>
        </span>
      </button>
      <div className="row-actions">
        <AddMenu media={{ tmdbId: r.tmdbId, mediaType: r.mediaType }} targets={targets} selfId={selfId} current={mine} size="sm" />
      </div>
    </div>
  );
}
