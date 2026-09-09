-- Let a member rename a shared list. Members have no update policy on
-- public.spaces (only select / insert / delete), so this goes through a
-- security-definer function that checks membership and only touches the name.
-- Safe to re-run.

create or replace function public.rename_space(space uuid, new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me    uuid := auth.uid();
  clean text := btrim(coalesce(new_name, ''));
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_space_member(space, me) then
    raise exception 'not a member of this list';
  end if;
  if clean = '' then
    raise exception 'name cannot be blank';
  end if;

  update public.spaces
  set name = left(clean, 60)
  where id = space;
end;
$$;

revoke all on function public.rename_space(uuid, text) from public;
grant execute on function public.rename_space(uuid, text) to authenticated;
