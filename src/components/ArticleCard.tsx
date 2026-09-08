import { useState } from "react";
import type { Article } from "../lib/guardian";
import { ArticleSheet } from "./ArticleSheet";

function when(iso: string): string {
  const d = new Date(iso);
  const days = Math.round((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ArticleCard({ a }: { a: Article }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="article" onClick={() => setOpen(true)}>
        {a.thumbnail && (
          <div className="article-thumb">
            <img src={a.thumbnail} alt="" loading="lazy" />
          </div>
        )}
        <div className="article-body">
          <div className="article-kicker">
            {a.section} · {when(a.published)}
          </div>
          <div className="article-title">{a.title}</div>
          {a.trail && <p className="article-trail">{a.trail}</p>}
        </div>
      </button>
      {open && <ArticleSheet a={a} onClose={() => setOpen(false)} />}
    </>
  );
}
