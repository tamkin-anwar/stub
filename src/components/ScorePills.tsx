interface Props {
  tmdb?: number | null;
  imdbId?: string | null;
}

/**
 * TMDB user score is always available from the API. IMDb has no public ratings
 * API, so we link out to the real IMDb page rather than inventing a number.
 */
export function ScorePills({ tmdb, imdbId }: Props) {
  if (!tmdb && !imdbId) return null;
  return (
    <span className="scores">
      {typeof tmdb === "number" && tmdb > 0 && <span className="tmdb">TMDB {tmdb.toFixed(1)}</span>}
      {imdbId && (
        <a
          className="imdb"
          href={`https://www.imdb.com/title/${imdbId}/`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          IMDb ↗
        </a>
      )}
    </span>
  );
}
