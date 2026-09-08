-- Harden account deletion. list_entries.owner_id is polymorphic (a user id or
-- a space id) so it has no foreign key, which means removing the auth user
-- cascades the profile, ratings, space memberships and friendships but leaves
-- the person's personal list rows orphaned. Delete those explicitly first,
-- then remove the auth user.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- personal list and its ratings (ratings cascade from list_entries)
  delete from public.list_entries where owner_type = 'user' and owner_id = uid;

  -- the rest cascades from auth.users -> profiles: ratings the person made,
  -- their space memberships, and any friendships they are part of
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
