/*
 * One-off: seed the "Tamkin & Ridu Film Archive" list into a user's account.
 * Resolves every title against TMDB, then writes scripts/seed.sql which you
 * apply with:  npx supabase db query --linked -f scripts/seed.sql
 *
 * Usage: node scripts/seed-my-list.mjs [username]   (default username: tamkinanwar)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const username = process.argv[2] || "tamkinanwar";

// TMDB token from .env
const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const TOKEN = env.VITE_TMDB_ACCESS_TOKEN;
if (!TOKEN) throw new Error("VITE_TMDB_ACCESS_TOKEN missing from .env");

// title | movie/tv | year | status | note
const LIST = [
  ["The Intern", "movie", 2015, "watched"],
  ["The Devil Wears Prada", "movie", 2006, "watched"],
  ["Project Hail Mary", "movie", 2026, "watched"],
  ["Love and Other Drugs", "movie", 2010, "watched"],
  ["The Hating Game", "movie", 2021, "watched"],
  ["Mr. & Mrs. Smith", "movie", 2005, "watched"],
  ["Fair Play", "movie", 2023, "watched"],
  ["Pride & Prejudice", "movie", 2005, "watched"],
  ["Knives Out", "movie", 2019, "watched"],
  ["Glass Onion: A Knives Out Mystery", "movie", 2022, "watched"],
  ["Wake Up Dead Man: A Knives Out Mystery", "movie", 2025, "watched"],
  ["Always Be My Maybe", "movie", 2019, "watched"],
  ["The Adam Project", "movie", 2022, "watched"],
  ["Friends with Benefits", "movie", 2011, "watched"],
  ["Your Name.", "movie", 2016, "watched"],
  ["Lucy", "movie", 2014, "watched"],
  ["Carry-On", "movie", 2024, "watched"],

  ["Wayward", "tv", 2025, "watched"],
  ["The Night Agent", "tv", 2023, "watched"],
  ["The Beast in Me", "tv", 2025, "watched"],
  ["Fool Me Once", "tv", 2024, "watched"],
  ["Run Away", "tv", 2026, "watched"],
  ["Hostage", "tv", 2025, "watched"],
  ["His & Hers", "tv", 2026, "watched"],

  ["The Four Seasons", "tv", 2025, "watching"],
  ["Weathering with You", "movie", 2019, "watching"],
  ["Game of Thrones", "tv", 2011, "watching", "Rewatch."],
  ["The Blacklist", "tv", 2013, "watching"],
  ["1899", "tv", 2022, "watching"],
  ["Black Doves", "tv", 2024, "watching"],
  ["Death Note", "tv", 2006, "watching"],
  ["Sirens", "tv", 2025, "watching"],
  ["When Life Gives You Tangerines", "tv", 2025, "watching"],
  ["Black Mirror", "tv", 2011, "watching"],
  ["Dragon Ball", "tv", 1986, "watching"],

  ["Crazy, Stupid, Love.", "movie", 2011, "watchlist"],
  ["American Psycho", "movie", 2000, "watchlist"],
  ["50/50", "movie", 2011, "watchlist"],
  ["The Perks of Being a Wallflower", "movie", 2012, "watchlist"],
  ["The Holiday", "movie", 2006, "watchlist"],
  ["Revolutionary Road", "movie", 2008, "watchlist"],
  ["Think Like a Man", "movie", 2012, "watchlist"],
  ["Think Like a Man Too", "movie", 2014, "watchlist"],
  ["Fight Club", "movie", 1999, "watchlist"],
  ["Pulp Fiction", "movie", 1994, "watchlist"],
  ["The Woman in the Window", "movie", 2021, "watchlist"],
  ["How to Make a Killing", "movie", 2026, "watchlist"],
  ["The Devil Wears Prada 2", "movie", 2026, "watchlist"],
  ["The Drama", "movie", 2026, "watchlist"],

  ["The Crown", "tv", 2016, "watchlist"],
  ["The Seven Dials Mystery", "tv", 2025, "watchlist"],
  ["The Umbrella Academy", "tv", 2019, "watchlist"],
  ["Behind Her Eyes", "tv", 2021, "watchlist"],
  ["Cyberpunk: Edgerunners", "tv", 2022, "watchlist"],
  ["Stranger Things", "tv", 2016, "watchlist"],
  ["Squid Game", "tv", 2021, "watchlist"],
  ["Suits", "tv", 2011, "watchlist"],
  ["House", "tv", 2004, "watchlist"],
  ["House of the Dragon", "tv", 2022, "watchlist"],
  ["Manifest", "tv", 2018, "watchlist"],
  ["Clickbait", "tv", 2021, "watchlist"],
  ["Outlander", "tv", 2014, "watchlist"],
];

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const qn = (v) => (v === null || v === undefined || v === "" ? "null" : v);
const qs = (v) => (v === null || v === undefined || v === "" ? "null" : q(v));
const yearOf = (d) => {
  const y = Number(String(d || "").slice(0, 4));
  return Number.isFinite(y) && y > 1870 ? y : null;
};

async function tmdb(path, params = {}) {
  const qsp = new URLSearchParams({ language: "en-US", ...params });
  const res = await fetch(`https://api.themoviedb.org/3${path}?${qsp}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} ${path}`);
  return res.json();
}

async function resolve(title, media, year) {
  const params = { query: title, include_adult: "false" };
  if (year) params[media === "movie" ? "primary_release_year" : "first_air_date_year"] = String(year);
  let { results } = await tmdb(`/search/${media}`, params);
  if (!results?.length) ({ results } = await tmdb(`/search/${media}`, { query: title }));
  if (!results?.length) return null;
  // prefer an exact-ish year match if we have one
  let pick = results[0];
  if (year) {
    const near = results.find((r) => {
      const ry = yearOf(r.release_date || r.first_air_date);
      return ry !== null && Math.abs(ry - year) <= 1;
    });
    if (near) pick = near;
  }
  const d = await tmdb(`/${media}/${pick.id}`, {
    append_to_response: media === "movie" ? "external_ids" : "external_ids",
  });
  const runtime =
    media === "movie"
      ? d.runtime ?? null
      : Array.isArray(d.episode_run_time) && d.episode_run_time.length
        ? d.episode_run_time[0]
        : null;
  return {
    tmdb_id: d.id,
    media_type: media,
    name: d.title || d.name,
    year: yearOf(d.release_date || d.first_air_date),
    overview: d.overview || null,
    poster_path: d.poster_path || null,
    backdrop_path: d.backdrop_path || null,
    runtime,
    genres: (d.genres || []).map((g) => g.name),
    tmdb_rating: typeof d.vote_average === "number" ? Math.round(d.vote_average * 10) / 10 : null,
    imdb_id: d.external_ids?.imdb_id || d.imdb_id || null,
  };
}

const owner = `(select id from public.profiles where username = ${q(username)})`;
const blocks = [];
const skipped = [];

for (const [title, media, year, status, note = ""] of LIST) {
  try {
    const t = await resolve(title, media, year);
    if (!t) {
      skipped.push(`${title} (${year})`);
      continue;
    }
    const genresSql = t.genres.length
      ? `array[${t.genres.map(q).join(",")}]::text[]`
      : `'{}'::text[]`;
    blocks.push(`-- ${t.name} (${t.year ?? "?"}) [${status}]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (${t.tmdb_id}, ${q(t.media_type)}, ${q(t.name)}, ${qn(t.year)}, ${qs(t.overview)}, ${qs(t.poster_path)}, ${qs(t.backdrop_path)}, ${qn(t.runtime)}, ${genresSql}, ${qn(t.tmdb_rating)}, ${qs(t.imdb_id)}, now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', ${owner}, t.id, ${q(status)}, ${owner}, ${q(note)},
       ${status === "watched" ? "current_date" : "null"}
from t
on conflict (owner_type, owner_id, title_id) do nothing;`);
    process.stdout.write(`ok  ${t.name}\n`);
  } catch (e) {
    skipped.push(`${title} (${year}) - ${e.message}`);
  }
}

const sql = `-- Seeded from the Tamkin & Ridu Film Archive for @${username}
-- ${blocks.length} titles. Apply: npx supabase db query --linked -f scripts/seed.sql
begin;
${blocks.join("\n\n")}
commit;
`;
writeFileSync(join(root, "scripts", "seed.sql"), sql);
console.log(`\nwrote scripts/seed.sql with ${blocks.length} titles`);
if (skipped.length) console.log(`skipped:\n  ${skipped.join("\n  ")}`);
