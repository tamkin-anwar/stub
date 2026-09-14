-- Notify the other person on a shared list when someone rates a title or
-- leaves a note there. Personal-list activity never notifies anyone.
-- Safe to re-run.

create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,     -- recipient
  actor_id     uuid not null references public.profiles(id) on delete cascade,     -- who did it
  space_id     uuid not null references public.spaces(id) on delete cascade,
  entry_id     uuid not null references public.list_entries(id) on delete cascade,
  kind         text not null check (kind in ('rating', 'note')),
  stars        numeric(2,1),
  note_excerpt text,
  read         boolean not null default false,
  created_at   timestamptz not null default now(),
  -- one outstanding notification per (recipient, entry, kind): a second
  -- rating or note edit refreshes it in place instead of piling up rows.
  unique (user_id, entry_id, kind)
);
create index if not exists notifications_user_idx
  on public.notifications (user_id, read, created_at desc);

-- ---------------------------------------------------------------------------
-- rating -> notify the other space member(s)
-- ---------------------------------------------------------------------------
create or replace function public.notify_on_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  entry record;
begin
  select owner_type, owner_id into entry
  from public.list_entries where id = new.entry_id;

  if entry.owner_type <> 'space' then
    return new;
  end if;

  insert into public.notifications (user_id, actor_id, space_id, entry_id, kind, stars)
  select m.user_id, new.user_id, entry.owner_id, new.entry_id, 'rating', new.stars
  from public.space_members m
  where m.space_id = entry.owner_id and m.user_id <> new.user_id
  on conflict (user_id, entry_id, kind) do update
    set actor_id = excluded.actor_id,
        stars = excluded.stars,
        read = false,
        created_at = now();

  return new;
end;
$$;

drop trigger if exists t_notify_rating on public.ratings;
create trigger t_notify_rating
  after insert or update of stars on public.ratings
  for each row execute function public.notify_on_rating();

-- ---------------------------------------------------------------------------
-- shared note -> notify the other space member(s)
-- ---------------------------------------------------------------------------
create or replace function public.notify_on_note()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if new.owner_type <> 'space' then
    return new;
  end if;
  if new.note is not distinct from old.note then
    return new;
  end if;
  if actor is null or btrim(new.note) = '' then
    return new;
  end if;

  insert into public.notifications (user_id, actor_id, space_id, entry_id, kind, note_excerpt)
  select m.user_id, actor, new.owner_id, new.id, 'note', left(new.note, 140)
  from public.space_members m
  where m.space_id = new.owner_id and m.user_id <> actor
  on conflict (user_id, entry_id, kind) do update
    set actor_id = excluded.actor_id,
        note_excerpt = excluded.note_excerpt,
        read = false,
        created_at = now();

  return new;
end;
$$;

drop trigger if exists t_notify_note on public.list_entries;
create trigger t_notify_note
  after update of note on public.list_entries
  for each row execute function public.notify_on_note();

-- ---------------------------------------------------------------------------
-- RLS: you can only ever see or mark your own notifications; rows are only
-- ever written by the trigger functions above (security definer, so they
-- write as their owner regardless of the caller's own grants).
-- ---------------------------------------------------------------------------
alter table public.notifications enable row level security;

drop policy if exists "notifications readable by recipient" on public.notifications;
create policy "notifications readable by recipient" on public.notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "notifications markable by recipient" on public.notifications;
create policy "notifications markable by recipient" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, update on public.notifications to authenticated;

do $$
begin
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
end $$;
