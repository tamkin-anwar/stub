import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../hooks/lists";
import { availableYears, computeYearStats } from "../lib/stats";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function Tile({ big, label, sub }: { big: string; label: string; sub?: string }) {
  return (
    <div className="card stat-tile">
      <div className="stat-big">{big}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="muted tiny" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function Stats() {
  const { profile } = useAuth();
  const owner = useMemo(
    () => (profile ? ({ type: "user", id: profile.id } as const) : null),
    [profile],
  );
  const { data: entries, isLoading } = useEntries(owner);
  const years = useMemo(() => availableYears(entries ?? []), [entries]);
  const [year, setYear] = useState(() => new Date().getFullYear());

  if (!profile) return null;

  const stats = computeYearStats(entries ?? [], year, profile.id);

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Your year</h1>
          <p className="page-sub">What you actually watched, not what you meant to.</p>
        </div>
        {years.length > 1 && (
          <select style={{ width: "auto" }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <p className="center-note">Loading…</p>
      ) : stats.watchedCount === 0 ? (
        <p className="center-note">Nothing marked watched in {year} yet.</p>
      ) : (
        <>
          <div className="stat-grid">
            <Tile
              big={String(stats.watchedCount)}
              label={stats.watchedCount === 1 ? "title watched" : "titles watched"}
              sub={`${stats.filmCount} film${stats.filmCount === 1 ? "" : "s"} · ${stats.seriesCount} series`}
            />
            <Tile big={`${stats.hours}`} label="hours, roughly" />
            {stats.avgRating != null && (
              <Tile
                big={`${stats.avgRating.toFixed(1)}★`}
                label="average rating"
                sub={`${stats.ratedCount} rated`}
              />
            )}
            {stats.rewatchedCount > 0 && (
              <Tile
                big={String(stats.rewatchedCount)}
                label={stats.rewatchedCount === 1 ? "title rewatched" : "titles rewatched"}
              />
            )}
            {stats.busiestMonth && (
              <Tile
                big={MONTH_NAMES[stats.busiestMonth.month]}
                label="your busiest month"
                sub={`${stats.busiestMonth.count} watched`}
              />
            )}
            {stats.topRated && (
              <Tile big={`${stats.topRated.stars.toFixed(1)}★`} label="your top rated" sub={stats.topRated.name} />
            )}
          </div>

          {stats.topGenres.length > 0 && (
            <div className="card" style={{ marginTop: 18 }}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>Top genres</p>
              {stats.topGenres.map((g) => (
                <div key={g.name} className="settings-kv">
                  <span>{g.name}</span>
                  <span className="mono">{g.count}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
