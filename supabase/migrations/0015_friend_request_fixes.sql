-- Two real bugs from live use:
--
-- 1. Nothing ever notified the addressee of a new friend request. rating
--    and note notifications exist; a friend request, the one thing that
--    actually needs someone's attention before anything else can happen,
--    never got one.
--
-- 2. friendships is only unique on the ordered pair (requester, addressee),
--    so if two people request each other before either accepts, both rows
--    exist at once. fetchFriendViews renders each row on its own, so the
--    other person shows up twice: once as an incoming request, once as an
--    already-accepted friend from whichever row got actioned.

-- ---------------------------------------------------------------------------
-- 1. Collapse any existing mirrored pair down to one row (none exist right
--    now, checked directly, but this makes the unique index below safe to
--    add regardless), then enforce it can never happen again.
-- ---------------------------------------------------------------------------
with ranked as (
  select
    id,
    row_number() over (
      partition by least(requester, addressee), greatest(requester, addressee)
      order by (status = 'accepted') desc, created_at asc
    ) as rn
  from public.friendships
)
delete from public.friendships f
using ranked r
where f.id = r.id and r.rn > 1;

alter table public.friendships
  add column if not exists user_lo uuid generated always as (least(requester, addressee)) stored,
  add column if not exists user_hi uuid generated always as (greatest(requester, addressee)) stored;

create unique index if not exists friendships_pair_unique on public.friendships (user_lo, user_hi);

-- ---------------------------------------------------------------------------
-- send_friend_request now checks for a reverse-direction row first: if the
-- other person already asked, this becomes an accept instead of a second,
-- mirrored pending row (the unique index above would reject that anyway,
-- but this makes the mutual case a good outcome instead of an error).
-- ---------------------------------------------------------------------------
create or replace function public.send_friend_request(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  existing record;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if target = me then
    raise exception 'cannot send yourself a friend request';
  end if;

  perform public.check_rate_limit('friend_request', 20, 600);

  select * into existing from public.friendships
    where (requester = me and addressee = target) or (requester = target and addressee = me)
    limit 1;

  if existing is not null then
    if existing.status = 'pending' and existing.requester = target then
      update public.friendships set status = 'accepted' where id = existing.id;
    end if;
    return;
  end if;

  insert into public.friendships (requester, addressee, status)
  values (me, target, 'pending')
  on conflict (requester, addressee) do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Friend-request notifications. entry_id/space_id were not-null because
-- every notification used to be tied to a title on a shared list; a friend
-- request is neither, so both become optional and this kind gets its own
-- dedupe key (one outstanding notification per requester, not per entry).
-- ---------------------------------------------------------------------------
alter table public.notifications
  alter column space_id drop not null,
  alter column entry_id drop not null;

alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications
  add constraint notifications_kind_check check (kind in ('rating', 'note', 'friend_request'));

create unique index if not exists notifications_friend_request_unique
  on public.notifications (user_id, actor_id)
  where kind = 'friend_request';

create or replace function public.notify_on_friend_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    if new.status = 'pending' then
      insert into public.notifications (user_id, actor_id, kind)
      values (new.addressee, new.requester, 'friend_request')
      on conflict (user_id, actor_id) where kind = 'friend_request' do update
        set read = false, created_at = now();
    end if;
    return new;
  elsif TG_OP = 'UPDATE' then
    if new.status = 'accepted' and old.status = 'pending' then
      delete from public.notifications
        where user_id = new.addressee and actor_id = new.requester and kind = 'friend_request';
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    delete from public.notifications
      where user_id = old.addressee and actor_id = old.requester and kind = 'friend_request';
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists t_notify_friend_request on public.friendships;
create trigger t_notify_friend_request
  after insert or update of status or delete on public.friendships
  for each row execute function public.notify_on_friend_request();
