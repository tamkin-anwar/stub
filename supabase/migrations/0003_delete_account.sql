-- Let a signed-in person delete their own account. Removing the auth.users
-- row cascades to profiles and, from there, to list_entries, ratings,
-- spaces, space_members and friendships (all FK "on delete cascade").
-- security definer so it can reach the auth schema; it only ever touches
-- the caller's own row.

create or replace function public.delete_own_account()
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
