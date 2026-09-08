import { useEffect, useRef } from "react";
import type { Article } from "../lib/guardian";

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Guardian media URLs end in /<width>.jpg; ask for a larger crop for the hero.
function hero(url: string | null): string | null {
  return url ? url.replace(/\/\d+\.jpg(\?.*)?$/, "/1000.jpg") : null;
}

/**
 * An in-app reader for a Guardian piece. Shows the headline, standfirst,
 * image and credit in Stub's own UI, then hands off to theguardian.com for
 * the full article (their text stays on their site).
 */
export function ArticleSheet({ a, onClose }: { a: Article; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const img = hero(a.thumbnail);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  function close() {
    ref.current?.close();
    onClose();
  }

  return (
    <dialog
      ref={ref}
      className="reader"
      onCancel={close}
      onClick={(e) => e.target === ref.current && close()}
    >
      <article className="reader-inner">
        <button className="reader-close" onClick={close} aria-label="Close">
          ×
        </button>

        {img && (
          <div className="reader-hero">
            <img src={img} alt="" />
          </div>
        )}

        <div className="reader-body">
          <div className="reader-kicker">
            {a.section} · {longDate(a.published)}
          </div>
          <h2 className="display reader-title">{a.title}</h2>
          {a.byline && <div className="reader-byline">{a.byline}</div>}
          {a.trail && <p className="reader-standfirst">{a.trail}</p>}

          <div className="reader-foot">
            <span className="reader-source">Full story at The Guardian</span>
            <a className="btn sm" href={a.url} target="_blank" rel="noreferrer">
              Continue reading ↗
            </a>
          </div>
        </div>
      </article>
    </dialog>
  );
}
