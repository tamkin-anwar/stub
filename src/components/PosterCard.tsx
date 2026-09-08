import type { ReactNode } from "react";
import { posterUrl } from "../lib/tmdb";
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
  const src = posterUrl(posterPath, "w342");
  const g = posterGradient(name);

  return (
    <button className="poster-card" onClick={onClick} type="button">
      <div className="poster">
        {src ? (
          <img src={src} alt={name} loading="lazy" />
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
