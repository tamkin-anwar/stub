import type { WatchProviderOption, WatchProviders as WatchProvidersData } from "../lib/types";
import { providerLogoUrl } from "../lib/tmdb";

function Row({ label, items }: { label: string; items: WatchProviderOption[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span className="muted" style={{ fontSize: 12.5, width: 52, flex: "none" }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {items.map((p) => {
          const logo = providerLogoUrl(p.logoPath);
          return logo ? (
            <img key={p.id} className="provider-logo" src={logo} alt={p.name} title={p.name} />
          ) : (
            <span key={p.id} className="provider-fallback" title={p.name}>
              {p.name.slice(0, 2).toUpperCase()}
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
          <Row label="Stream" items={flatrate} />
          <Row label="Free" items={free} />
          <Row label="Rent" items={rent} />
          <Row label="Buy" items={buy} />
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
