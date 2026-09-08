-- Stub schema. Run this once in the Supabase SQL editor
-- (Dashboard -> SQL editor -> New query -> paste -> Run).
-- It is safe to re-run: every object uses "if not exists" or "or replace".

create extension if not exists citext;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, created automatically on sign up
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     citext unique not null,
  display_name text not null default '',
  accent       text not null default 'amber',
  created_at   timestamptz not null default now(),
  constraint username_len check (char_length(username) between 2 and 24),
  constraint username_fmt check (username ~ '^[a-z0-9_]+$')
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(
      nullif(lower(new.raw_user_meta_data->>'username'), ''),
      'user_' || substr(replace(new.id::text, '-', ''), 1, 8)
    ),
    coalesce(new.raw_user_meta_data->>'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- titles: local cache of TMDB media so lists reference a stable row
-- ---------------------------------------------------------------------------
create table if not exists public.titles (
  id            bigint generated always as identity primary key,
  tmdb_id       integer not null,
  media_type    text not null check (media_type in ('movie','tv')),
  name          text not null,
  year          integer,
  overview      text,
  poster_path   text,
  backdrop_path text,
  runtime       integer,
  genres        text[] not null default '{}',
  tmdb_rating   numeric(3,1),
  imdb_id       text,
  updated_at    timestamptz not null default now(),
  unique (tmdb_id, media_type)
);

-- ---------------------------------------------------------------------------
-- spaces: a shared list owned by more than one person (a couple, for now)
-- ---------------------------------------------------------------------------
create table if not exists public.spaces (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default 'Our list',
  kind       text not null default 'couple',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.space_members (
  space_id   uuid not null references public.spaces(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (space_id, user_id)
);

-- ---------------------------------------------------------------------------
-- friendships
-- ---------------------------------------------------------------------------
create table if not exists public.friendships (
  id         uuid primary key default gen_random_uuid(),
  requester  uuid not null references public.profiles(id) on delete cascade,
  addressee  uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_self check (requester <> addressee),
  unique (requester, addressee)
);
create index if not exists friendships_addressee_idx on public.friendships (addressee, status);
create index if not exists friendships_requester_idx on public.friendships (requester, status);

-- ---------------------------------------------------------------------------
-- list_entries: a title on someone's list (owner_type 'user' or 'space')
-- ---------------------------------------------------------------------------
create table if not exists public.list_entries (
  id         uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('user','space')),
  owner_id   uuid not null,
  title_id   bigint not null references public.titles(id) on delete cascade,
  status     text not null default 'watchlist' check (status in ('watchlist','watching','watched')),
  added_by   uuid references public.profiles(id) on delete set null,
  watched_on date,
  note       text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_type, owner_id, title_id)
);
create index if not exists list_entries_owner_idx on public.list_entries (owner_type, owner_id);

-- ---------------------------------------------------------------------------
-- ratings: one row per person per entry (this is how his/hers works)
-- ---------------------------------------------------------------------------
create table if not exists public.ratings (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null references public.list_entries(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  stars      numeric(2,1) not null check (stars >= 0.5 and stars <= 5 and (stars * 2) = floor(stars * 2)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_id, user_id)
);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists t_touch_list on public.list_entries;
create trigger t_touch_list before update on public.list_entries
  for each row execute function public.touch_updated_at();

drop trigger if exists t_touch_ratings on public.ratings;
create trigger t_touch_ratings before update on public.ratings
  for each row execute function public.touch_updated_at();

drop trigger if exists t_touch_friendships on public.friendships;
create trigger t_touch_friendships before update on public.friendships
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- security-definer helpers (bypass RLS to avoid recursive policy checks)
-- ---------------------------------------------------------------------------
create or replace function public.is_space_member(space uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.space_members m
    where m.space_id = space and m.user_id = uid
  );
$$;

create or replace function public.can_access_entry(e uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.list_entries le
    where le.id = e
      and (
        (le.owner_type = 'user' and le.owner_id = uid)
        or (le.owner_type = 'space' and public.is_space_member(le.owner_id, uid))
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- RPC: pair with an accepted friend and get (or create) a shared space
-- ---------------------------------------------------------------------------
create or replace function public.create_couple_space(friend uuid, space_name text default 'Our list')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid;
  me  uuid := auth.uid();
begin
  if me is null then raise exception 'not authenticated'; end if;
  if friend = me then raise exception 'cannot pair with yourself'; end if;

  if not exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester = me and addressee = friend) or (requester = friend and addressee = me))
  ) then
    raise exception 'you must be friends before sharing a list';
  end if;

  select s.id into sid
  from public.spaces s
  where s.kind = 'couple'
    and (select count(*) from public.space_members m where m.space_id = s.id) = 2
    and exists (select 1 from public.space_members m where m.space_id = s.id and m.user_id = me)
    and exists (select 1 from public.space_members m where m.space_id = s.id and m.user_id = friend)
  limit 1;
  if sid is not null then return sid; end if;

  insert into public.spaces (name, kind, created_by)
  values (coalesce(nullif(space_name, ''), 'Our list'), 'couple', me)
  returning id into sid;

  insert into public.space_members (space_id, user_id) values (sid, me), (sid, friend);
  return sid;
end;
$$;
grant execute on function public.create_couple_space(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.titles        enable row level security;
alter table public.spaces        enable row level security;
alter table public.space_members enable row level security;
alter table public.friendships   enable row level security;
alter table public.list_entries  enable row level security;
alter table public.ratings       enable row level security;

drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles
  for select to authenticated using (true);
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "titles readable" on public.titles;
create policy "titles readable" on public.titles
  for select to authenticated using (true);
drop policy if exists "titles insert" on public.titles;
create policy "titles insert" on public.titles
  for insert to authenticated with check (true);
drop policy if exists "titles update" on public.titles;
create policy "titles update" on public.titles
  for update to authenticated using (true) with check (true);

drop policy if exists "spaces visible to members" on public.spaces;
create policy "spaces visible to members" on public.spaces
  for select to authenticated using (public.is_space_member(id));
drop policy if exists "spaces insert by creator" on public.spaces;
create policy "spaces insert by creator" on public.spaces
  for insert to authenticated with check (created_by = auth.uid());
drop policy if exists "spaces delete by member" on public.spaces;
create policy "spaces delete by member" on public.spaces
  for delete to authenticated using (public.is_space_member(id));

drop policy if exists "space members visible to members" on public.space_members;
create policy "space members visible to members" on public.space_members
  for select to authenticated using (public.is_space_member(space_id));
drop policy if exists "leave space" on public.space_members;
create policy "leave space" on public.space_members
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "friendships visible to involved" on public.friendships;
create policy "friendships visible to involved" on public.friendships
  for select to authenticated using (requester = auth.uid() or addressee = auth.uid());
drop policy if exists "send friend request" on public.friendships;
create policy "send friend request" on public.friendships
  for insert to authenticated with check (requester = auth.uid() and status = 'pending');
drop policy if exists "respond to friend request" on public.friendships;
create policy "respond to friend request" on public.friendships
  for update to authenticated
  using (addressee = auth.uid() or requester = auth.uid())
  with check (addressee = auth.uid() or requester = auth.uid());
drop policy if exists "remove friendship" on public.friendships;
create policy "remove friendship" on public.friendships
  for delete to authenticated using (requester = auth.uid() or addressee = auth.uid());

drop policy if exists "entries readable" on public.list_entries;
create policy "entries readable" on public.list_entries
  for select to authenticated using (
    (owner_type = 'user' and owner_id = auth.uid())
    or (owner_type = 'space' and public.is_space_member(owner_id))
  );
drop policy if exists "entries insert" on public.list_entries;
create policy "entries insert" on public.list_entries
  for insert to authenticated with check (
    added_by = auth.uid() and (
      (owner_type = 'user' and owner_id = auth.uid())
      or (owner_type = 'space' and public.is_space_member(owner_id))
    )
  );
drop policy if exists "entries update" on public.list_entries;
create policy "entries update" on public.list_entries
  for update to authenticated using (
    (owner_type = 'user' and owner_id = auth.uid())
    or (owner_type = 'space' and public.is_space_member(owner_id))
  ) with check (
    (owner_type = 'user' and owner_id = auth.uid())
    or (owner_type = 'space' and public.is_space_member(owner_id))
  );
drop policy if exists "entries delete" on public.list_entries;
create policy "entries delete" on public.list_entries
  for delete to authenticated using (
    (owner_type = 'user' and owner_id = auth.uid())
    or (owner_type = 'space' and public.is_space_member(owner_id))
  );

drop policy if exists "ratings readable" on public.ratings;
create policy "ratings readable" on public.ratings
  for select to authenticated using (public.can_access_entry(entry_id));
drop policy if exists "ratings insert own" on public.ratings;
create policy "ratings insert own" on public.ratings
  for insert to authenticated with check (user_id = auth.uid() and public.can_access_entry(entry_id));
drop policy if exists "ratings update own" on public.ratings;
create policy "ratings update own" on public.ratings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "ratings delete own" on public.ratings;
create policy "ratings delete own" on public.ratings
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- grants (RLS still filters every row; these just open the tables to the role)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.titles to anon;
grant usage, select on all sequences in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- realtime
-- ---------------------------------------------------------------------------
do $$
begin
  begin alter publication supabase_realtime add table public.list_entries; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.ratings;      exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.friendships;  exception when duplicate_object then null; end;
end $$;
