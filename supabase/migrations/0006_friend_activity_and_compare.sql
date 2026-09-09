-- Friend activity and list comparison.
--
-- Both functions are security definer and each one gates on an accepted
-- friendship, so they only ever return what the product already promises:
-- "find people by username and see what they've been watching". They read
-- personal lists only (owner_type = 'user'), never a shared space, and never
-- a note. Safe to re-run.

-- ---------------------------------------------------------------------------
-- friend_activity: recent ratings your accepted friends left on their own
-- personal lists, newest first.
-- ---------------------------------------------------------------------------
create or replace function public.friend_activity(max_rows int default 30)
returns table (
  actor_id     uuid,
  username     text,
  display_name text,
  accent       text,
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

-- ---------------------------------------------------------------------------
-- list_compare: your personal list against one friend's, bucketed into
-- 'both', 'mine' and 'theirs', with each side's status and rating.
-- ---------------------------------------------------------------------------
create or replace function public.list_compare(friend uuid)
returns table (
  bucket       text,
  tmdb_id      integer,
  media_type   text,
  name         text,
  year         integer,
  poster_path  text,
  my_status    text,
  their_status text,
  my_stars     numeric,
  their_stars  numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if friend = me then
    raise exception 'pick someone else';
  end if;
  if not exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester = me and addressee = friend)
        or (requester = friend and addressee = me))
  ) then
    raise exception 'you are not friends with this person';
  end if;

  return query
  with mine as (
    select le.title_id, le.status, le.id as entry_id
    from public.list_entries le
    where le.owner_type = 'user' and le.owner_id = me
  ),
  theirs as (
    select le.title_id, le.status, le.id as entry_id
    from public.list_entries le
    where le.owner_type = 'user' and le.owner_id = friend
  ),
  joined as (
    select
      coalesce(m.title_id, th.title_id) as title_id,
      m.status    as my_status,
      th.status   as their_status,
      m.entry_id  as my_entry,
      th.entry_id as their_entry
    from mine m
    full outer join theirs th on th.title_id = m.title_id
  )
  select
    case
      when j.my_status is not null and j.their_status is not null then 'both'
      when j.my_status is not null then 'mine'
      else 'theirs'
    end,
    t.tmdb_id, t.media_type, t.name, t.year, t.poster_path,
    j.my_status, j.their_status,
    (select r.stars from public.ratings r where r.entry_id = j.my_entry and r.user_id = me),
    (select r.stars from public.ratings r where r.entry_id = j.their_entry and r.user_id = friend)
  from joined j
  join public.titles t on t.id = j.title_id
  order by 1, t.name;
end;
$$;

revoke all on function public.list_compare(uuid) from public;
grant execute on function public.list_compare(uuid) to authenticated;
