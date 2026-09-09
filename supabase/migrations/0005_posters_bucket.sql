-- A public bucket for cached poster art. The /api/poster edge function copies
-- each TMDB poster in here the first time it is seen, so the grid stops
-- depending on TMDB's image CDN. Safe to re-run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posters',
  'posters',
  true,
  3 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Readable by anyone. There is deliberately no insert / update / delete policy:
-- writes happen only through the edge function, which uses the service role and
-- bypasses row level security. A signed-in user cannot upload here.
drop policy if exists "posters read" on storage.objects;
create policy "posters read"
  on storage.objects for select
  using (bucket_id = 'posters');
