import { useState, type ReactNode } from "react";
import { posterUrl } from "../lib/tmdb";
import { cachePoster, storedPosterUrl } from "../lib/posters";
import { posterGradient } from "../lib/format";

interface Props {
  name: string;
  year: number | null;
  posterPath: string | null;
  badge?: "watched" | "watching" | null;
  fav?: boolean;
  sub?: ReactNode;
  onClick?: () => void;
}

export function PosterCard({ name, year, posterPath, badge, fav, sub, onClick }: Props) {
  const stored = storedPosterUrl(posterPath);
  const tmdb = posterUrl(posterPath, "w342");
  const g = posterGradient(name);

  // 0 = Storage copy, 1 = TMDB CDN, 2 = painted fallback.
  const [stage, setStage] = useState<0 | 1 | 2>(stored ? 0 : tmdb ? 1 : 2);
  const src = stage === 0 ? stored : stage === 1 ? tmdb : null;

  function onError() {
    if (stage === 0) {
      cachePoster(posterPath);
      setStage(tmdb ? 1 : 2);
    } else if (stage === 1) {
      setStage(2);
    }
  }

  return (
    <button className="poster-card" onClick={onClick} type="button">
      <div className="poster">
        {src ? (
          <img key={stage} src={src} alt={name} loading="lazy" onError={onError} />
        ) : (
          <div className="fallback" style={{ ["--d" as string]: g.d, ["--m" as string]: g.m }}>
            <span className="ftitle">{name}</span>
            <span className="fyear">{year ?? "TBA"}</span>
          </div>
        )}
        {badge === "watched" && <span className="badge ok">Watched</span>}
        {badge === "watching" && (
          <span className="badge live">
            <i />
            Watching
          </span>
        )}
        {fav && <span className="heart">♥</span>}
      </div>
      <div className="pc-title">{name}</div>
      {sub !== undefined ? <div className="pc-sub">{sub}</div> : <div className="pc-sub">{year ?? ""}</div>}
    </button>
  );
}
