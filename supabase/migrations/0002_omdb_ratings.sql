-- Cache IMDb / Rotten Tomatoes / Metacritic scores (from OMDb) on titles,
-- so lists and cards can show them without re-fetching per view.
alter table public.titles
  add column if not exists imdb_rating   numeric(3,1),
  add column if not exists imdb_votes    integer,
  add column if not exists rt_rating     integer,
  add column if not exists metacritic    integer,
  add column if not exists omdb_checked_at timestamptz;
