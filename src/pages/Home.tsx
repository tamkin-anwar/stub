import { useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useArticles, useClassics, useTrending, useUpcoming } from "../hooks/library";
import { useSpaces } from "../hooks/social";
import { DiscoverCard } from "../components/DiscoverCard";
import { ScoreLegend } from "../components/ScoreLegend";
import { ArticleCard } from "../components/ArticleCard";
import { type AddTarget } from "../components/AddMenu";
import type { TmdbTitle } from "../lib/types";
import { guardianReady, tmdbReady } from "../lib/env";

function Shelf({
  label,
  title,
  more,
  children,
}: {
  label: string;
  title: string;
  more?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 44 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          paddingBottom: 12,
          marginBottom: 20,
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {label}
          </div>
          <h2 className="display" style={{ fontSize: 24 }}>
            {title}
          </h2>
        </div>
        {more}
      </div>
      {children}
    </section>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const days = Math.round((d.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "out now";
  if (days === 1) return "tomorrow";
  if (days < 30) return `in ${days} days`;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const upcoming = useUpcoming();
  const trending = useTrending();
  const classics = useClassics();
  const articles = useArticles();
  const { data: spaces } = useSpaces(profile?.id);

  const targets = useMemo<AddTarget[]>(() => {
    if (!profile) return [];
    const t: AddTarget[] = [{ label: "My list", owner: { type: "user", id: profile.id } }];
    for (const s of spaces ?? []) t.push({ label: s.name, owner: { type: "space", id: s.id } });
    return t;
  }, [profile, spaces]);

  if (!profile) return null;

  const strip = (rows: TmdbTitle[] | undefined, opts?: { dates?: boolean }) => (
    <div className="grid">
      {(rows ?? []).slice(0, 12).map((r) => (
        <DiscoverCard
          key={`${r.mediaType}-${r.tmdbId}`}
          r={r}
          targets={targets}
          selfId={profile.id}
          withScores={!opts?.dates}
          subOverride={
            opts?.dates ? (
              <span className="scores">
                <span className="tmdb">{fmtDate(r.date)}</span>
              </span>
            ) : undefined
          }
          onOpen={() => navigate(`/app/title/${r.mediaType}/${r.tmdbId}`)}
        />
      ))}
    </div>
  );

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Home</h1>
          <p className="page-sub">What is coming, what people are talking about, what to revisit.</p>
        </div>
      </div>

      {!tmdbReady && (
        <div className="card" style={{ marginBottom: 20 }}>
          Set <code>VITE_TMDB_ACCESS_TOKEN</code> in <code>.env</code> to populate this page.
        </div>
      )}

      <ScoreLegend />

      <Shelf
        label="Release radar"
        title="Coming soon"
        more={<Link to="/app/library" className="btn ghost sm">Browse all</Link>}
      >
        {upcoming.isLoading ? (
          <p className="center-note">Loading…</p>
        ) : (
          strip(upcoming.data, { dates: true })
        )}
      </Shelf>

      <Shelf label="Right now" title="This week">
        {trending.isLoading ? <p className="center-note">Loading…</p> : strip(trending.data)}
      </Shelf>

      {guardianReady && (articles.data?.length ?? 0) > 0 && (
        <Shelf label="Film & TV desk" title="In the press">
          <div className="article-grid">
            {(articles.data ?? []).map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </div>
        </Shelf>
      )}

      <Shelf label="From the archive" title="Worth revisiting">
        {classics.isLoading ? <p className="center-note">Loading…</p> : strip(classics.data)}
      </Shelf>
    </div>
  );
}
