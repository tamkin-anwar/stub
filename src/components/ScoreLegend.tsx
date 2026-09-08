/**
 * A small key for the rating marks used on cards: the IMDb badge, the
 * Rotten Tomatoes tomato (fresh) or splat (rotten), the Metacritic square,
 * and the TMDB fallback. Purely informational.
 */
export function ScoreLegend() {
  return (
    <div className="score-legend">
      <span className="score-legend-key">Ratings</span>

      <span className="score-legend-item">
        <span className="scores">
          <span className="imdb">
            <span className="imdb-badge">IMDb</span>
          </span>
        </span>
        audience score, out of 10
      </span>

      <span className="score-legend-item">
        <span className="scores">
          <svg className="rt-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="14.5" r="7.5" fill="#fa320a" />
            <path
              d="M12 6.2c.9-2.3 3-3.6 5.4-3.4-.2 2.3-2.2 4-4.6 4.1C11.9 5 10 3.8 7.8 3.9c.9 1 1.8 2.3 1.8 4 .7-.8 1.5-1.4 2.4-1.7Z"
              fill="#3fa34d"
            />
          </svg>
          <svg className="rt-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2.5l2.1 3.1 3.5-1.2-.9 3.6 3.7 1.4-2.9 2.4 2.2 3.1-3.7-.4-.8 3.6-3.5-2.4-3.5 2.4-.8-3.6-3.7.4 2.2-3.1-2.9-2.4 3.7-1.4-.9-3.6 3.5 1.2z"
              fill="#00a95c"
            />
          </svg>
        </span>
        Rotten Tomatoes, fresh 60%+ or rotten below
      </span>

      <span className="score-legend-item">
        <span className="scores">
          <span className="mc" style={{ background: "#54a72a" }}>
            MC
          </span>
        </span>
        Metacritic, out of 100
      </span>

      <span className="score-legend-item">
        <span className="scores">
          <span className="tmdb">TMDB</span>
        </span>
        shown when IMDb has no score
      </span>
    </div>
  );
}
