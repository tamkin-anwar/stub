interface Props {
  imdb?: number | null;
  rt?: number | null; // Rotten Tomatoes critics %
  metacritic?: number | null;
  tmdb?: number | null;
  imdbId?: string | null;
}

function TomatoFresh() {
  return (
    <svg className="rt-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="14.5" r="7.5" fill="#fa320a" />
      <path
        d="M12 6.2c.9-2.3 3-3.6 5.4-3.4-.2 2.3-2.2 4-4.6 4.1C11.9 5 10 3.8 7.8 3.9c.9 1 1.8 2.3 1.8 4 .7-.8 1.5-1.4 2.4-1.7Z"
        fill="#3fa34d"
      />
    </svg>
  );
}
function TomatoRotten() {
  return (
    <svg className="rt-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5l2.1 3.1 3.5-1.2-.9 3.6 3.7 1.4-2.9 2.4 2.2 3.1-3.7-.4-.8 3.6-3.5-2.4-3.5 2.4-.8-3.6-3.7.4 2.2-3.1-2.9-2.4 3.7-1.4-.9-3.6 3.5 1.2z"
        fill="#00a95c"
      />
    </svg>
  );
}

/**
 * IMDb / Rotten Tomatoes / Metacritic come from OMDb (RT has no public API of
 * its own). TMDB is the fallback. Any missing score is left out. The IMDb badge
 * links to the real IMDb page.
 */
export function ScorePills({ imdb, rt, metacritic, tmdb, imdbId }: Props) {
  const hasImdb = typeof imdb === "number" && imdb > 0;
  const hasRt = typeof rt === "number" && rt >= 0;
  const hasMc = typeof metacritic === "number" && metacritic > 0;
  const hasTmdb = typeof tmdb === "number" && tmdb > 0;
  if (!hasImdb && !hasRt && !hasMc && !hasTmdb && !imdbId) return null;

  const mcColor = !hasMc
    ? undefined
    : metacritic! >= 61
      ? "#54a72a"
      : metacritic! >= 40
        ? "#d8ad2b"
        : "#d0403b";

  const imdbInner = (
    <>
      <span className="imdb-badge">IMDb</span>
      {hasImdb && <span className="imdb-val">{imdb!.toFixed(1)}</span>}
    </>
  );

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
          {imdbInner}
        </a>
      ) : (
        hasImdb && <span className="imdb">{imdbInner}</span>
      )}
      {hasRt && (
        <span className="rt">
          {rt! >= 60 ? <TomatoFresh /> : <TomatoRotten />}
          {Math.round(rt!)}%
        </span>
      )}
      {hasMc && (
        <span className="mc" style={{ background: mcColor }}>
          {Math.round(metacritic!)}
        </span>
      )}
      {!hasImdb && hasTmdb && <span className="tmdb">TMDB {tmdb!.toFixed(1)}</span>}
    </span>
  );
}
