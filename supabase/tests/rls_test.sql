-- Row-level security and account-deletion tests.
-- Run with a local stack up:  supabase start  &&  npm run test:db
-- (pgTAP is enabled by the Supabase test harness.)

begin;
select plan(17);

-- ---------------------------------------------------------------------------
-- fixtures, as the migration/superuser role
-- ---------------------------------------------------------------------------
insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'u1@test.dev', '{"username":"user_one"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'u2@test.dev', '{"username":"user_two"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'u3@test.dev', '{"username":"user_three"}', now(), now());

select is(
  (select count(*)::int from public.profiles
   where id in (
     '11111111-1111-1111-1111-111111111111',
     '22222222-2222-2222-2222-222222222222',
     '33333333-3333-3333-3333-333333333333')),
  3,
  'the sign-up trigger creates a profile for every new auth user');

insert into public.titles (tmdb_id, media_type, name) values (603, 'movie', 'The Matrix');

-- ---------------------------------------------------------------------------
-- helper to act as a given user
-- ---------------------------------------------------------------------------
create or replace function pg_temp.login(uid text) returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
end;
$$;

create or replace function pg_temp.logout() returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- u1 builds a personal list
-- ---------------------------------------------------------------------------
select pg_temp.login('11111111-1111-1111-1111-111111111111');

insert into public.list_entries (owner_type, owner_id, title_id, added_by, status)
values ('user', '11111111-1111-1111-1111-111111111111',
        (select id from public.titles where tmdb_id = 603),
        '11111111-1111-1111-1111-111111111111', 'watched');

select set_config('test.entry_id',
  (select id::text from public.list_entries
   where owner_id = '11111111-1111-1111-1111-111111111111' limit 1), true);

insert into public.ratings (entry_id, user_id, stars)
values (current_setting('test.entry_id')::uuid, '11111111-1111-1111-1111-111111111111', 4.5);

select is((select count(*)::int from public.list_entries), 1, 'u1 sees their own entry');
select is((select count(*)::int from public.ratings), 1, 'u1 sees their own rating');

-- ---------------------------------------------------------------------------
-- u2 is walled off from u1's personal data
-- ---------------------------------------------------------------------------
select pg_temp.login('22222222-2222-2222-2222-222222222222');

select is((select count(*)::int from public.list_entries), 0, 'u2 cannot read u1 personal entries');
select is((select count(*)::int from public.ratings), 0, 'u2 cannot read ratings on u1 private entry');

with upd as (update public.list_entries set note = 'tampered' returning 1)
select is((select count(*)::int from upd), 0, 'u2 update of u1 entry touches no rows');

with del as (delete from public.list_entries returning 1)
select is((select count(*)::int from del), 0, 'u2 delete of u1 entry touches no rows');

select throws_ok(
  format(
    $$insert into public.ratings (entry_id, user_id, stars) values (%L, %L, 3.0)$$,
    current_setting('test.entry_id'), '22222222-2222-2222-2222-222222222222'),
  '42501',
  'u2 cannot attach a rating to u1 private entry');

with upd as (update public.profiles set display_name = 'Nope'
             where id = '11111111-1111-1111-1111-111111111111' returning 1)
select is((select count(*)::int from upd), 0, 'u2 cannot edit u1 profile');

-- ---------------------------------------------------------------------------
-- a shared couple list is visible to both members, no one else
-- ---------------------------------------------------------------------------
select pg_temp.logout();
insert into public.friendships (requester, addressee, status)
values ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted');

select pg_temp.login('11111111-1111-1111-1111-111111111111');
select set_config('test.space_id',
  public.create_couple_space('22222222-2222-2222-2222-222222222222', 'Ours')::text, true);

insert into public.list_entries (owner_type, owner_id, title_id, added_by, status)
values ('space', current_setting('test.space_id')::uuid,
        (select id from public.titles where tmdb_id = 603),
        '11111111-1111-1111-1111-111111111111', 'watchlist');

select is((select count(*)::int from public.list_entries where owner_type = 'space'), 1,
  'u1 sees the shared entry');

select pg_temp.login('22222222-2222-2222-2222-222222222222');
select is((select count(*)::int from public.list_entries where owner_type = 'space'), 1,
  'u2 sees the shared entry too');

select pg_temp.login('33333333-3333-3333-3333-333333333333');
select is((select count(*)::int from public.list_entries where owner_type = 'space'), 0,
  'u3, not a member, sees nothing of the shared list');

select throws_ok(
  $$select public.create_couple_space('11111111-1111-1111-1111-111111111111')$$,
  'P0001',
  'u3 cannot pair with someone they are not friends with');

-- ---------------------------------------------------------------------------
-- delete_own_account removes only the caller and their personal data
-- ---------------------------------------------------------------------------
select pg_temp.login('11111111-1111-1111-1111-111111111111');
select lives_ok($$select public.delete_own_account()$$, 'u1 can delete their own account');

select pg_temp.logout();
select is((select count(*)::int from auth.users where id = '11111111-1111-1111-1111-111111111111'), 0,
  'u1 auth row is gone');
select is((select count(*)::int from auth.users where id = '22222222-2222-2222-2222-222222222222'), 1,
  'u2 auth row is untouched');
select is((select count(*)::int from public.list_entries
           where owner_type = 'user' and owner_id = '11111111-1111-1111-1111-111111111111'), 0,
  'u1 personal list rows are purged, not orphaned');

select * from finish();
rollback;
