-- Track rewatches on a list entry: a plain counter plus the date bumps
-- forward each time, rather than a full watch-history log (nobody has asked
-- for a timeline of every viewing, just "have I seen this again").

alter table public.list_entries
  add column if not exists rewatch_count integer not null default 0;

alter table public.list_entries
  drop constraint if exists rewatch_count_nonneg;

alter table public.list_entries
  add constraint rewatch_count_nonneg check (rewatch_count >= 0);
