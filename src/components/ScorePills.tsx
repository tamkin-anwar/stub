interface Props {
  imdb?: number | null;
  rt?: number | null; // Rotten Tomatoes critics %
  metacritic?: number | null;
  tmdb?: number | null;
  imdbId?: string | null;
}

/**
 * IMDb / Rotten Tomatoes / Metacritic come from OMDb (RT has no public API of
 * its own). TMDB is always available. Any missing score is simply left out.
 * The IMDb figure links to the real IMDb page.
 */
export function ScorePills({ imdb, rt, metacritic, tmdb, imdbId }: Props) {
  const hasImdb = typeof imdb === "number" && imdb > 0;
  const hasRt = typeof rt === "number" && rt > 0;
  const hasMc = typeof metacritic === "number" && metacritic > 0;
  const hasTmdb = typeof tmdb === "number" && tmdb > 0;
  if (!hasImdb && !hasRt && !hasMc && !hasTmdb && !imdbId) return null;

  const imdbText = hasImdb ? `IMDb ${imdb!.toFixed(1)}` : "IMDb ↗";

  return (
    <span className="scores">
      {imdbId ? (
        <a
          className="imdb"
          href={`https://www.imdb.com/title/${imdbId}/`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {imdbText}
        </a>
      ) : (
        hasImdb && <span className="imdb">{imdbText}</span>
      )}
      {hasRt && <span className="rt">RT {Math.round(rt!)}%</span>}
      {hasMc && <span className="mc">MC {Math.round(metacritic!)}</span>}
      {hasTmdb && <span className="tmdb">TMDB {tmdb!.toFixed(1)}</span>}
    </span>
  );
}
