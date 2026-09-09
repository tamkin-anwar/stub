import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useOmdb, useTitleDetail } from "../hooks/library";
import { entriesKey, useEntries } from "../hooks/lists";
import { refreshTitleScores } from "../data/lists";
import { useSpaces } from "../hooks/social";
import { AddMenu, type AddTarget } from "../components/AddMenu";
import { EntrySheet } from "../components/EntrySheet";
import { ScorePills } from "../components/ScorePills";
import { LoadError } from "../components/States";
import { backdropUrl, posterUrl, profileUrl } from "../lib/tmdb";
import { posterGradient, runtimeLabel } from "../lib/format";
import type { MediaType } from "../lib/types";

export function TitlePage() {
  const { mediaType, tmdbId } = useParams<{ mediaType: MediaType; tmdbId: string }>();
  const idNum = Number(tmdbId);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: detail, isLoading, error, refetch } = useTitleDetail(mediaType, idNum || undefined);
  const { data: omdb } = useOmdb(detail?.imdbId);
  const { data: personal } = useEntries(profile ? { type: "user", id: profile.id } : null);
  const { data: spaces } = useSpaces(profile?.id);
  const qc = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);

  const targets = useMemo<AddTarget[]>(() => {
    if (!profile) return [];
    const t: AddTarget[] = [{ label: "My list", owner: { type: "user", id: profile.id } }];
    for (const s of spaces ?? []) t.push({ label: s.name, owner: { type: "space", id: s.id } });
    return t;
  }, [profile, spaces]);

  const onMyList = useMemo(
    () => (personal ?? []).find((e) => e.title.tmdb_id === idNum && e.title.media_type === mediaType) ?? null,
    [personal, idNum, mediaType],
  );

  // Backfill OMDb scores onto the cached title row once, so lists show them too.
  useEffect(() => {
    if (onMyList && !onMyList.title.omdb_checked_at && onMyList.title.imdb_id && profile) {
      void refreshTitleScores(onMyList.title.id, onMyList.title.imdb_id).then(() =>
        qc.invalidateQueries({ queryKey: entriesKey({ type: "user", id: profile.id }) }),
      );
    }
  }, [onMyList, profile, qc]);

  if (!profile) return null;
  if (isLoading) return <TitleSkeleton />;
  if (error || !detail)
    return (
      <div className="wrap page">
        <LoadError note="This title did not load." onRetry={() => refetch()} />
      </div>
    );

  const bd = backdropUrl(detail.backdropPath);
  const poster = posterUrl(detail.posterPath, "w342");
  const g = posterGradient(detail.name);

  return (
    <div className="wrap page">
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="detail-hero" style={!bd ? { background: `linear-gradient(158deg, ${g.d}, ${g.m})` } : undefined}>
        {bd && <img className="bd" src={bd} alt="" />}
        <div className="scrim" />
        <div className="content">
          <div className="eyebrow" style={{ color: "rgba(244,239,232,0.75)" }}>
            {detail.mediaType === "movie" ? "Film" : "Series"}
            {detail.year ? ` · ${detail.year}` : ""}
          </div>
          <h1>{detail.name}</h1>
          {detail.tagline && <p style={{ marginTop: 6, opacity: 0.85 }}>{detail.tagline}</p>}
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="poster" style={{ marginBottom: 14 }}>
            {poster ? (
              <img src={poster} alt={detail.name} />
            ) : (
              <div className="fallback" style={{ ["--d" as string]: g.d, ["--m" as string]: g.m }}>
                <span className="ftitle">{detail.name}</span>
              </div>
            )}
          </div>
          {onMyList ? (
            <button className="btn primary" style={{ width: "100%" }} onClick={() => setSheetOpen(true)}>
              On your list · {onMyList.status}
            </button>
          ) : (
            <AddMenu media={{ tmdbId: idNum, mediaType: detail.mediaType }} targets={targets} selfId={profile.id} size="md" />
          )}
        </div>

        <div>
          <div className="page-sub" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
            {runtimeLabel(detail.runtime, detail.mediaType) && <span>{runtimeLabel(detail.runtime, detail.mediaType)}</span>}
            {detail.genres.length > 0 && <span>{detail.genres.join(", ")}</span>}
            <ScorePills
              imdb={omdb?.imdb ?? onMyList?.title.imdb_rating}
              rt={omdb?.rt ?? onMyList?.title.rt_rating}
              metacritic={omdb?.metacritic ?? onMyList?.title.metacritic}
              tmdb={detail.voteAverage}
              imdbId={detail.imdbId}
            />
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, maxWidth: "62ch" }}>{detail.overview || "No synopsis yet."}</p>

          {detail.cast.length > 0 && (
            <>
              <p className="eyebrow" style={{ margin: "26px 0 12px" }}>Cast</p>
              <div className="cast-grid cast">
                {detail.cast.map((c, i) => {
                  const pp = profileUrl(c.profilePath);
                  return (
                    <div key={`${c.name}-${c.character}-${i}`}>
                      <div className="poster" style={{ aspectRatio: "1 / 1", borderRadius: 10, marginBottom: 6 }}>
                        {pp ? (
                          <img src={pp} alt={c.name} />
                        ) : (
                          <div className="fallback" style={{ ["--d" as string]: g.d, ["--m" as string]: g.m }} />
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</div>
                      {c.character && <div className="ch">{c.character}</div>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {sheetOpen && onMyList && (
        <EntrySheet
          entry={onMyList}
          owner={{ type: "user", id: profile.id }}
          members={[profile]}
          selfId={profile.id}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}

function TitleSkeleton() {
  return (
    <div className="wrap page" aria-hidden="true">
      <div className="skel" style={{ height: 300, borderRadius: 10, marginBottom: 26 }} />
      <div className="detail-grid">
        <div>
          <div className="skel skel-poster" style={{ marginBottom: 14 }} />
          <div className="skel skel-line" style={{ height: 40, borderRadius: 7 }} />
        </div>
        <div>
          <div className="skel skel-line" style={{ width: "60%", marginBottom: 16 }} />
          <div className="skel skel-line" style={{ marginBottom: 8 }} />
          <div className="skel skel-line" style={{ marginBottom: 8 }} />
          <div className="skel skel-line" style={{ width: "75%" }} />
        </div>
      </div>
    </div>
  );
}
