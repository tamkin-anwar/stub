import type { WatchProviderOption, WatchProviders as WatchProvidersData } from "../lib/types";
import { providerLogoUrl } from "../lib/tmdb";

function Row({ label, items, link }: { label: string; items: WatchProviderOption[]; link: string | null }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span className="muted" style={{ fontSize: 12.5, width: 52, flex: "none" }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {items.map((p) => {
          // TMDB's free tier only hands back one link per region (JustWatch's
          // own page for the title), not a deep link per provider — that
          // needs a paid JustWatch partnership. So every logo opens the same
          // page, which does have a real link out to each service from
          // there: one extra click, but never a guessed URL.
          const logo = providerLogoUrl(p.logoPath, "w92");
          const inner = logo ? (
            <img className="provider-logo" src={logo} alt={p.name} />
          ) : (
            <span className="provider-fallback">{p.name.slice(0, 2).toUpperCase()}</span>
          );
          return link ? (
            <a key={p.id} href={link} target="_blank" rel="noreferrer" title={`${p.name} — see options`}>
              {inner}
            </a>
          ) : (
            <span key={p.id} title={p.name}>
              {inner}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Streaming, rental and purchase options for exactly one region: the
 *  viewer's own, detected from their browser locale. Data comes straight
 *  from TMDB's watch/providers, which is licensed from JustWatch — never
 *  guessed, never blended across countries, and attributed per their terms. */
export function WatchProviders({ providers }: { providers: WatchProvidersData | null }) {
  if (!providers) return null;

  const { flatrate, free, rent, buy, link, region } = providers;
  const empty = flatrate.length === 0 && free.length === 0 && rent.length === 0 && buy.length === 0;

  return (
    <div className="field">
      <label>Where to watch</label>
      {empty ? (
        <p className="muted" style={{ fontSize: 13.5 }}>
          Nothing found for {region} right now.
        </p>
      ) : (
        <>
          <Row label="Stream" items={flatrate} link={link} />
          <Row label="Free" items={free} link={link} />
          <Row label="Rent" items={rent} link={link} />
          <Row label="Buy" items={buy} link={link} />
        </>
      )}
      <p className="tiny muted" style={{ marginTop: 4 }}>
        Streaming data from JustWatch, for {region}.
        {link && (
          <>
            {" "}
            <a href={link} target="_blank" rel="noreferrer">
              See all options
            </a>
          </>
        )}
      </p>
    </div>
  );
}
