-- Every /api/* edge function already rate-limits by IP (see api/_shared.ts).
-- These three calls don't go through that proxy at all: they hit Postgres
-- directly from the browser with the anon key, so nothing has ever throttled
-- someone scripting hundreds of friend requests or scraping every username
-- through the search box. Moving them behind a security-definer RPC that
-- checks a per-user counter closes that gap without touching what RLS
-- already allows (any authenticated user could already read any profile;
-- this only gates the *rate*, not the data).

create table if not exists public.rate_limits (
  user_id      uuid not null references auth.users(id) on delete cascade,
  bucket       text not null,
  window_start timestamptz not null default now(),
  count        int not null default 0,
  primary key (user_id, bucket)
);

alter table public.rate_limits enable row level security;
-- No policy grants anon/authenticated direct access: only the security
-- definer functions below ever touch this table.

create or replace function public.check_rate_limit(p_bucket text, p_max int, p_window_seconds int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me  uuid := auth.uid();
  rec record;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  select * into rec from public.rate_limits where user_id = me and bucket = p_bucket for update;

  if rec is null then
    insert into public.rate_limits (user_id, bucket, window_start, count) values (me, p_bucket, now(), 1);
    return;
  end if;

  if rec.window_start < now() - (p_window_seconds || ' seconds')::interval then
    update public.rate_limits set window_start = now(), count = 1
      where user_id = me and bucket = p_bucket;
    return;
  end if;

  if rec.count >= p_max then
    raise exception 'Too many requests. Wait a few minutes and try again.' using errcode = '42901';
  end if;

  update public.rate_limits set count = count + 1 where user_id = me and bucket = p_bucket;
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from public;
-- Deliberately not granted to authenticated either: only called from inside
-- the other functions in this file, never directly by a client.

create or replace function public.send_friend_request(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if target = me then
    raise exception 'cannot send yourself a friend request';
  end if;

  perform public.check_rate_limit('friend_request', 20, 600);

  insert into public.friendships (requester, addressee, status)
  values (me, target, 'pending')
  on conflict (requester, addressee) do nothing;
end;
$$;

revoke all on function public.send_friend_request(uuid) from public;
grant execute on function public.send_friend_request(uuid) to authenticated;

create or replace function public.search_profiles(term text)
returns setof public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  q  text;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  q := trim(regexp_replace(term, '[%,()"''\\*]', ' ', 'g'));
  if char_length(q) < 2 then
    return;
  end if;

  perform public.check_rate_limit('profile_lookup', 40, 120);

  return query
    select p.* from public.profiles p
    where (p.username ilike '%' || q || '%' or p.display_name ilike '%' || q || '%')
      and p.id <> me
    limit 12;
end;
$$;

revoke all on function public.search_profiles(text) from public;
grant execute on function public.search_profiles(text) to authenticated;

-- Same bucket as search: an exact-match lookup by username (used by invite
-- links) is the same abuse surface — enumerate usernames one at a time
-- instead of by substring — so it shares the limit rather than opening a
-- separate unlimited path around it.
create or replace function public.get_profile_by_username(uname text)
returns setof public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  perform public.check_rate_limit('profile_lookup', 40, 120);

  return query
    select p.* from public.profiles p
    where p.username = trim(leading '@' from trim(uname));
end;
$$;

revoke all on function public.get_profile_by_username(text) from public;
grant execute on function public.get_profile_by_username(text) to authenticated;
