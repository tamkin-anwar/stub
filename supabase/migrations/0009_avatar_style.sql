-- Preset character avatars, alongside the existing initials + colour.
-- 'initials' keeps today's look; every other value picks a silhouette
-- drawn client-side, so there is no image to store or upload.

alter table public.profiles
  add column if not exists avatar_style text not null default 'initials';

alter table public.profiles
  drop constraint if exists avatar_style_check;

alter table public.profiles
  add constraint avatar_style_check check (
    avatar_style in (
      'initials', 'classic', 'cropped', 'curly', 'bun',
      'waves', 'beanie', 'beret', 'scarf'
    )
  );

-- friend_activity carries avatar_style too, so the Home feed can render a
-- friend's chosen character without a second profile fetch. The return
-- shape is changing, so the old signature has to go first.
drop function if exists public.friend_activity(int);

create function public.friend_activity(max_rows int default 30)
returns table (
  actor_id     uuid,
  username     text,
  display_name text,
  accent       text,
  avatar_style text,
  stars        numeric,
  tmdb_id      integer,
  media_type   text,
  name         text,
  year         integer,
  poster_path  text,
  rated_at     timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with friends as (
    select case when requester = auth.uid() then addressee else requester end as fid
    from public.friendships
    where status = 'accepted'
      and (requester = auth.uid() or addressee = auth.uid())
  )
  select
    r.user_id,
    p.username::text,
    p.display_name,
    p.accent,
    p.avatar_style,
    r.stars,
    t.tmdb_id,
    t.media_type,
    t.name,
    t.year,
    t.poster_path,
    r.updated_at
  from public.ratings r
  join public.list_entries le on le.id = r.entry_id
  join public.titles t on t.id = le.title_id
  join public.profiles p on p.id = r.user_id
  where le.owner_type = 'user'
    and le.owner_id = r.user_id
    and r.user_id in (select fid from friends)
  order by r.updated_at desc
  limit greatest(1, least(coalesce(max_rows, 30), 60));
$$;

revoke all on function public.friend_activity(int) from public;
grant execute on function public.friend_activity(int) to authenticated;
