-- Shared lists were always architecturally fine for more than two people:
-- list_entries, ratings and every RLS policy already key off is_space_member
-- with no count limit. The only thing hard-coded to a pair was how a space
-- got its members. This adds the one thing missing: growing an existing
-- shared list by adding another accepted friend to it.

create or replace function public.add_space_member(space uuid, friend uuid, max_members int default 8)
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
  if not public.is_space_member(space, me) then
    raise exception 'not a member of this list';
  end if;
  if friend = me then
    raise exception 'that is you';
  end if;
  if not exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester = me and addressee = friend) or (requester = friend and addressee = me))
  ) then
    raise exception 'you must be friends with them first';
  end if;
  if public.is_space_member(space, friend) then
    raise exception 'already on this list';
  end if;
  if (select count(*) from public.space_members m where m.space_id = space) >= max_members then
    raise exception 'this list is full';
  end if;

  insert into public.space_members (space_id, user_id) values (space, friend);
end;
$$;

revoke all on function public.add_space_member(uuid, uuid, int) from public;
grant execute on function public.add_space_member(uuid, uuid, int) to authenticated;
