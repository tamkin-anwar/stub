/*
 * One-off: fetch OMDb scores for titles that are cached but have no OMDb data,
 * and write scripts/omdb-backfill.sql (UPDATE statements). Apply with:
 *   npx supabase db query --linked -f scripts/omdb-backfill.sql
 *
 * Reads a list to process from /tmp/omdb-todo.json, an array of {id, imdb_id}.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const KEY = env.VITE_OMDB_API_KEY;
if (!KEY) throw new Error("VITE_OMDB_API_KEY missing from .env");

const todo = JSON.parse(readFileSync("/tmp/omdb-todo.json", "utf8"));
const num = (s) => {
  const n = Number.parseFloat(String(s ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};
const q = (v) => (v === null || v === undefined ? "null" : v);

const stmts = [];
for (const { id, imdb_id } of todo) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${encodeURIComponent(imdb_id)}`);
    const d = await res.json();
    if (d.Response === "False") {
      console.log(`skip  ${imdb_id}: ${d.Error}`);
      continue;
    }
    const rt = d.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value ?? null;
    const mc =
      d.Ratings?.find((r) => r.Source === "Metacritic")?.Value ??
      (d.Metascore && d.Metascore !== "N/A" ? `${d.Metascore}/100` : null);
    const imdb = num(d.imdbRating);
    const votes = num(d.imdbVotes);
    const rtN = rt ? num(rt) : null;
    const mcN = mc ? num(mc) : null;
    stmts.push(
      `update public.titles set imdb_rating=${q(imdb)}, imdb_votes=${q(votes)}, ` +
        `rt_rating=${q(rtN)}, metacritic=${q(mcN)}, omdb_checked_at=now() where id=${id};`,
    );
    console.log(`ok    ${d.Title}  IMDb ${imdb ?? "-"}  RT ${rtN ?? "-"}  MC ${mcN ?? "-"}`);
    await new Promise((r) => setTimeout(r, 120));
  } catch (e) {
    console.log(`err   ${imdb_id}: ${e.message}`);
  }
}

writeFileSync(
  join(root, "scripts", "omdb-backfill.sql"),
  `-- OMDb backfill for ${stmts.length} cached titles\nbegin;\n${stmts.join("\n")}\ncommit;\n`,
);
console.log(`\nwrote scripts/omdb-backfill.sql with ${stmts.length} updates`);
