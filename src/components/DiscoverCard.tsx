import type { ReactNode } from "react";
import { useCardScores } from "../hooks/library";
import { PosterCard } from "./PosterCard";
import { AddMenu, type AddTarget, type CurrentEntry } from "./AddMenu";
import type { ListStatus, TmdbTitle } from "../lib/types";

interface Props {
  r: TmdbTitle;
  targets: AddTarget[];
  selfId: string;
  onOpen: () => void;
  /** When set, replaces the auto score line (e.g. a release date). */
  subOverride?: ReactNode;
  /** Fetch IMDb/RT for this card. Off for unreleased titles. */
  withScores?: boolean;
  /** Set when this title is already on the viewer's personal list. */
  mine?: CurrentEntry | null;
}

const BADGE: Record<ListStatus, "watched" | "watching" | "watchlist"> = {
  watched: "watched",
  watching: "watching",
  watchlist: "watchlist",
};

export function DiscoverCard({
  r,
  targets,
  selfId,
  onOpen,
  subOverride,
  withScores = true,
  mine = null,
}: Props) {
  const cs = useCardScores(r.mediaType, r.tmdbId, withScores && subOverride === undefined);
  const kind = r.mediaType === "movie" ? "Film" : "Series";
  const hasImdb = typeof cs.data?.imdb === "number" && cs.data.imdb > 0;
  const hasRt = typeof cs.data?.rt === "number" && cs.data.rt >= 0;

  const sub =
    subOverride !== undefined ? (
      subOverride
    ) : (
      <span className="scores">
        <span className="tmdb">{kind}</span>
        {hasImdb && (
          <span className="imdb">
            <span className="imdb-badge">IMDb</span>
            <span className="imdb-val">{cs.data!.imdb!.toFixed(1)}</span>
          </span>
        )}
        {hasRt && (
          <span className="rt">
            <svg className="rt-icon" viewBox="0 0 24 24" aria-hidden="true">
              {cs.data!.rt! >= 60 ? (
                <>
                  <circle cx="12" cy="14.5" r="7.5" fill="#fa320a" />
                  <path
                    d="M12 6.2c.9-2.3 3-3.6 5.4-3.4-.2 2.3-2.2 4-4.6 4.1C11.9 5 10 3.8 7.8 3.9c.9 1 1.8 2.3 1.8 4 .7-.8 1.5-1.4 2.4-1.7Z"
                    fill="#3fa34d"
                  />
                </>
              ) : (
                <path
                  d="M12 2.5l2.1 3.1 3.5-1.2-.9 3.6 3.7 1.4-2.9 2.4 2.2 3.1-3.7-.4-.8 3.6-3.5-2.4-3.5 2.4-.8-3.6-3.7.4 2.2-3.1-2.9-2.4 3.7-1.4-.9-3.6 3.5 1.2z"
                  fill="#00a95c"
                />
              )}
            </svg>
            {Math.round(cs.data!.rt!)}%
          </span>
        )}
        {!hasImdb && !hasRt && r.voteAverage ? (
          <span className="tmdb">TMDB {r.voteAverage.toFixed(1)}</span>
        ) : null}
      </span>
    );

  return (
    <div style={{ position: "relative" }}>
      <PosterCard
        name={r.name}
        year={r.year}
        posterPath={r.posterPath}
        badge={mine ? BADGE[mine.status] : null}
        sub={sub}
        onClick={onOpen}
      />
      <div style={{ position: "absolute", top: 8, right: 8 }}>
        <AddMenu
          media={{ tmdbId: r.tmdbId, mediaType: r.mediaType }}
          targets={targets}
          selfId={selfId}
          current={mine}
        />
      </div>
    </div>
  );
}
