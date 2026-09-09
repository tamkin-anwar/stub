# Stub

A watch tracker you keep with the people you watch with. Every film and series you have seen or mean to, with your own rating and notes, plus a second list you share with a partner where you both add titles and both rate them. Real posters, cast, and runtimes come from TMDB; accounts and data live on Supabase.

Web first (React), with the backend kept as a plain API so a native iOS client can reuse it later. Every user's data is isolated at the database level, so this runs as a real multi-user app, not a single-owner tool.

Built by Anwar Creative Studio.

## What it does

- **Your own list.** Watchlist, watching, and watched, each title with your star rating (half steps), a note, and the month you saw it. Filter by films or series and by status, search, and sort.
- **A list together.** Pair with an accepted friend and get one shared list. Both of you add titles, and each entry carries a rating per person, so "his and hers" scores sit side by side with the average. Your personal list stays yours.
- **Friends.** Find people by username, send and accept requests, and choose who you share a list with. Compare your list against any friend's: what you both have, what only one of you has, and what you have both seen.
- **A living library.** Search the full catalogue, or browse what is trending, in cinemas, and on air this week. Sort by rating, year or name. Add anything to any list in two clicks.
- **Scores on every card.** IMDb, Rotten Tomatoes and Metacritic, pulled once per title from OMDb and cached, shown on list cards, library cards and title pages, with a small legend.
- **A home page.** Recent film and TV coverage from The Guardian in an in-app reader, the latest ratings from your friends, what is coming, what is trending this week, and older films worth another look.
- **Title pages.** Backdrop, synopsis, cast, runtime, all the scores, and a link out to the real IMDb page.
- **Settings.** Theme (system, light, dark), a JSON export of your whole list, and account deletion behind a typed confirmation that also purges your personal rows.

## How it works

A list entry has an `owner_type` of either `user` or `space`. A personal list and a shared list run through the same code, they just point at a different owner. Ratings are their own table, one row per person per entry, which is why a shared entry can hold two ratings at once.

Titles are cached in a local `titles` table when first added, so a list points at a stable row and your history does not shift if TMDB changes.

Postgres row level security does the access control. A signed-in user can read and write their own `user` entries and any `space` entry for a space they belong to. Ratings are readable by anyone who can see the parent entry and writable only for your own row. Pairing two people into a shared space goes through a `security definer` function that first checks the friendship is accepted.

## Tech stack

- React 18, Vite, TypeScript, code-split by route
- react-router-dom
- TanStack Query for server state
- Supabase: Postgres, email auth, row level security, realtime
- `/api/*` Vercel Edge functions proxy TMDB, OMDb and The Guardian: the keys stay server-side and responses are cached on the CDN, so the free-tier limits are shared across everyone rather than spent per visit
- Vitest for unit tests, pgTAP for the row-level-security and account-deletion tests, GitHub Actions to run both

## The API proxy

The browser never talks to TMDB, OMDb or The Guardian directly. It calls
`/api/tmdb`, `/api/omdb` and `/api/guardian`, which:

- hold the keys in server-only env vars (no `VITE_` prefix, never bundled),
- set `Cache-Control: s-maxage` so Vercel's edge caches the response — title
  detail for a day, discovery feeds for 15 minutes, the press feed for 30,
  IMDb/RT scores for a week,
- allow-list only the read endpoints the app uses.

So the first person to open "trending" this hour pays the upstream calls; the
next few thousand are served from the edge. During `vite dev` a small plugin
in `vite.config.ts` runs the same handler modules so `/api/*` works locally.

Each function also runs a best-effort per-IP rate limit (in the edge
instance's memory, ceilings well above any real session) so one client cannot
run the free-tier budgets down. For a hard limit, add a rule in the Vercel
firewall.

`/api/poster` is opt-in (see the env table). When it and `VITE_POSTER_CACHE`
are set, it copies each TMDB poster into a public Supabase Storage bucket the
first time a card renders it, and the grid serves the Storage copy from then
on. Without it, cards use TMDB image URLs as before.

## Why Stub

Letterboxd is a public diary. A group text is where "what should we watch" goes to die. Stub is the small private middle: one list that is yours, one that is ours, and a real catalogue to pull from, with no feed and no account required from anyone you are not already watching with.

## Running locally

### 1. Install

```bash
npm install
```

### 2. Supabase

1. Create a free project at https://supabase.com/dashboard.
2. Open the SQL editor and run each file in `supabase/migrations/` in order (`0001` through `0006`), or `supabase link` and `supabase db push`.
3. Auth, Providers, Email is on by default. For quick local testing, turn off "Confirm email" so new accounts can sign in right away; with it on, sign-up shows a "confirm your email" step.
4. Project Settings, API: copy the Project URL and the `anon` public key.

### 3. TMDB

1. Create a free account at https://www.themoviedb.org.
2. Settings, API, request a key, then copy the **API Read Access Token** (v4 auth, a long token starting with `eyJ`).

### 4. Environment

```bash
cp .env.example .env
# then fill in the values
```

| var | side | required | what |
|---|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | client | yes | the database and auth |
| `TMDB_ACCESS_TOKEN` | server (`/api/*`) | yes | titles, artwork, discovery |
| `OMDB_API_KEY` | server | no | IMDb / Rotten Tomatoes / Metacritic scores |
| `GUARDIAN_API_KEY` | server | no | the "In the press" feed |
| `SUPABASE_SERVICE_ROLE_KEY` | server | no | lets `/api/poster` write to Storage |
| `VITE_POSTER_CACHE` | client | no | set to `1` to serve posters from Storage |
| `VITE_SENTRY_DSN` | client | no | a Sentry DSN turns on crash reporting |

The server vars have **no `VITE_` prefix** on purpose, so they never reach the
browser. On Vercel, add them as plain (not `VITE_`) environment variables;
`vite dev` reads them from `.env` for the local `/api` plugin. For the poster
cache, also run `supabase/migrations/0005_posters_bucket.sql` and set
`VITE_POSTER_CACHE=1`.

### 5. Run

```bash
npm run dev
```

Open the local URL Vite prints, create an account, and start adding titles from the Library. Until the two Supabase values are set, the app shows a setup screen instead of booting.

## Data model

| Table | Purpose |
|---|---|
| `profiles` | One row per auth user, created by a trigger on sign up. Holds the username and display name. |
| `titles` | Local cache of TMDB media so lists reference a stable row. |
| `list_entries` | A title on a list. `owner_type` is `user` or `space`; carries status, note, and watched date. |
| `ratings` | One row per person per entry. This is how a couple's two ratings live on one shared entry. |
| `friendships` | Requester, addressee, and status (`pending` or `accepted`). |
| `spaces` + `space_members` | A shared list and who belongs to it. `create_couple_space(friend)` pairs two accepted friends. |

## Scripts

```bash
npm run dev        # dev server
npm run build      # typecheck, then production build
npm run typecheck  # types only
npm test           # unit tests (Vitest)
npm run test:db    # row-level-security tests (needs a local Supabase: supabase start)
npm run preview    # serve the build
npm run icons      # regenerate the PNG icons from the mark
```

## Testing

`npm test` covers the pure logic: OMDb score parsing, Guardian article mapping, TMDB normalisation and the upcoming/classic filters, list averages, and theme persistence.

`supabase/tests/rls_test.sql` is a pgTAP suite that runs against a throwaway database (`supabase start && npm run test:db`, or the CI `database` job). It asserts that one user cannot read or write another's personal list or ratings or profile, that a couple space is visible only to its two members, that `friend_activity` and `list_compare` only return data between accepted friends, and that `delete_own_account` removes exactly the caller and their personal rows.

CI (`.github/workflows/ci.yml`) runs typecheck, unit tests and the build on every push, plus the database tests on a fresh Supabase stack.

## What's here now, and what's next

- Done: accounts with email confirmation, personal list, shared couple list with per-person ratings, friends, TMDB search and discovery feeds, IMDb / RT / Metacritic scores, a home page with a Guardian press feed, title pages with cast, a theme switch, list export, account deletion, privacy and terms pages, a mobile layout, an installable manifest, and an `/api/*` proxy that keeps the third-party keys server-side and caches their responses on the CDN.
- Done (opt-in): `/api/poster` caches TMDB poster art into Supabase Storage so the grid does not depend on TMDB's CDN. Off until `SUPABASE_SERVICE_ROLE_KEY` and `VITE_POSTER_CACHE` are set.
- Done: a per-IP rate limit on every `/api/*` function, and crash reporting to Sentry when `VITE_SENTRY_DSN` is set.
- Done: a friend activity feed on the home page, and list comparison between any two friends (both security-definer RPCs gated on an accepted friendship).
- Not yet: a native iOS client on the same Supabase API.
- Not yet: spaces larger than two people.

## Prototype

`prototype/archive.html` is the original single file version that seeded the idea: one HTML file, no accounts, list kept in the page itself.
