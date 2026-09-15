-- Row-level security and account-deletion tests.
-- Run with a local stack up:  supabase start  &&  npm run test:db
-- (pgTAP is enabled by the Supabase test harness.)

begin;
select plan(53);

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
  '42501', null,
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

select set_config('test.shared_entry_id',
  (select id::text from public.list_entries where owner_type = 'space' limit 1), true);

select pg_temp.login('22222222-2222-2222-2222-222222222222');
select is((select count(*)::int from public.list_entries where owner_type = 'space'), 1,
  'u2 sees the shared entry too');

select pg_temp.login('33333333-3333-3333-3333-333333333333');
select is((select count(*)::int from public.list_entries where owner_type = 'space'), 0,
  'u3, not a member, sees nothing of the shared list');

select throws_ok(
  $$select public.create_couple_space('11111111-1111-1111-1111-111111111111')$$,
  'P0001', null,
  'u3 cannot pair with someone they are not friends with');

-- ---------------------------------------------------------------------------
-- rename_space: a member can rename, a non-member and a blank name cannot
-- ---------------------------------------------------------------------------
select pg_temp.login('11111111-1111-1111-1111-111111111111');
select lives_ok(
  format($$select public.rename_space(%L, 'Movie Nights')$$, current_setting('test.space_id')),
  'a member can rename the shared list');
select is(
  (select name from public.spaces where id = current_setting('test.space_id')::uuid),
  'Movie Nights',
  'the new name stuck');

select pg_temp.login('33333333-3333-3333-3333-333333333333');
select throws_ok(
  format($$select public.rename_space(%L, 'Hijacked')$$, current_setting('test.space_id')),
  'P0001', null,
  'a non-member cannot rename the list');

-- ---------------------------------------------------------------------------
-- notifications: a rating or a shared note tells the other space member,
-- never the actor, and repeat activity refreshes one row instead of piling up
-- ---------------------------------------------------------------------------
select pg_temp.login('11111111-1111-1111-1111-111111111111');
insert into public.ratings (entry_id, user_id, stars)
values (current_setting('test.shared_entry_id')::uuid, '11111111-1111-1111-1111-111111111111', 4.5);

select pg_temp.login('22222222-2222-2222-2222-222222222222');
select is(
  (select count(*)::int from public.notifications where kind = 'rating'),
  1,
  'u2 is notified of the rating u1 left on their shared entry');
select is(
  (select actor_id from public.notifications where kind = 'rating'),
  '11111111-1111-1111-1111-111111111111',
  'the notification is attributed to u1');

select pg_temp.login('11111111-1111-1111-1111-111111111111');
select is(
  (select count(*)::int from public.notifications),
  0,
  'u1 is not notified of their own rating');
update public.ratings set stars = 3.5
  where entry_id = current_setting('test.shared_entry_id')::uuid
    and user_id = '11111111-1111-1111-1111-111111111111';
update public.list_entries set note = 'Loved this one'
  where id = current_setting('test.shared_entry_id')::uuid;

select pg_temp.login('22222222-2222-2222-2222-222222222222');
select is(
  (select count(*)::int from public.notifications where kind = 'rating'),
  1,
  'changing the rating again refreshes the same notification, not a second one');
select is(
  (select stars from public.notifications where kind = 'rating'),
  3.5,
  'the refreshed notification carries the latest rating');
select is(
  (select count(*)::int from public.notifications where kind = 'note'),
  1,
  'u2 is notified of the shared note u1 left');
select throws_ok(
  format(
    $$insert into public.notifications (user_id, actor_id, space_id, entry_id, kind)
      values (%L, %L, %L, %L, 'rating')$$,
    '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
    current_setting('test.space_id'), current_setting('test.shared_entry_id')),
  '42501', null,
  'a client cannot insert a notification directly');

-- ---------------------------------------------------------------------------
-- friend_activity + list_compare: security definer, gated on friendship
-- ---------------------------------------------------------------------------
select pg_temp.login('22222222-2222-2222-2222-222222222222');
select is(
  (select count(*)::int from public.friend_activity()),
  1,
  'friend_activity shows u2 the rating u1 left on their own list');
select is(
  (select bucket from public.list_compare('11111111-1111-1111-1111-111111111111') limit 1),
  'theirs',
  'list_compare buckets a title only u1 has as "theirs"');

select pg_temp.login('33333333-3333-3333-3333-333333333333');
select is(
  (select count(*)::int from public.friend_activity()),
  0,
  'friend_activity is empty for someone with no friends');
select throws_ok(
  $$select * from public.list_compare('11111111-1111-1111-1111-111111111111')$$,
  'P0001', null,
  'list_compare refuses a non-friend');

-- ---------------------------------------------------------------------------
-- add_space_member: a shared list can grow past a pair, gated on the
-- *actor's* own friendship with whoever they're adding, not any member's
-- ---------------------------------------------------------------------------
select pg_temp.logout();
insert into public.friendships (requester, addressee, status)
values ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'accepted');

select pg_temp.login('22222222-2222-2222-2222-222222222222');
select throws_ok(
  format($$select public.add_space_member(%L, '33333333-3333-3333-3333-333333333333')$$,
    current_setting('test.space_id')),
  'P0001', null,
  'u2 cannot add u3: u2 is not friends with u3, even though u1 (a fellow member) is');

select pg_temp.login('11111111-1111-1111-1111-111111111111');
select lives_ok(
  format($$select public.add_space_member(%L, '33333333-3333-3333-3333-333333333333')$$,
    current_setting('test.space_id')),
  'u1 can add u3, a friend of theirs, to the shared list');

select pg_temp.login('33333333-3333-3333-3333-333333333333');
select is((select count(*)::int from public.list_entries where owner_type = 'space'), 1,
  'u3 now sees the shared entry after being added as a third member');

select pg_temp.login('11111111-1111-1111-1111-111111111111');
select throws_ok(
  format($$select public.add_space_member(%L, '33333333-3333-3333-3333-333333333333')$$,
    current_setting('test.space_id')),
  'P0001', null,
  'u3 cannot be added twice');
select throws_ok(
  format($$select public.add_space_member(%L, '44444444-4444-4444-4444-444444444444')$$,
    current_setting('test.space_id')),
  'P0001', null,
  'adding someone with no accepted friendship at all fails the same way');

-- ---------------------------------------------------------------------------
-- check_rate_limit: the gate behind send_friend_request and search_profiles,
-- since neither goes through the /api/* proxy's per-IP limiter
-- ---------------------------------------------------------------------------
select pg_temp.login('22222222-2222-2222-2222-222222222222');

select lives_ok($$select public.check_rate_limit('rl_test_a', 3, 60)$$, 'call 1 of 3 is fine');
select lives_ok($$select public.check_rate_limit('rl_test_a', 3, 60)$$, 'call 2 of 3 is fine');
select lives_ok($$select public.check_rate_limit('rl_test_a', 3, 60)$$, 'call 3 of 3 is fine');
select throws_ok(
  $$select public.check_rate_limit('rl_test_a', 3, 60)$$,
  '42901', 'Too many requests. Wait a few minutes and try again.',
  'the 4th call inside the window is refused');

select lives_ok(
  $$select public.check_rate_limit('rl_test_b', 1, 1)$$,
  'a fresh bucket with its own 1-second window is unaffected by rl_test_a');
select throws_ok(
  $$select public.check_rate_limit('rl_test_b', 1, 1)$$,
  '42901', null,
  'immediately over that bucket''s own limit');
select pg_sleep(1.1); -- plain statement, not a TAP assertion: just clears the 1-second window
select lives_ok(
  $$select public.check_rate_limit('rl_test_b', 1, 1)$$,
  'the window has rolled over, so this one is allowed again');

-- ---------------------------------------------------------------------------
-- send_friend_request and search_profiles: same RLS-visible data as before,
-- just gated on rate now, and self-targeting is refused outright
-- ---------------------------------------------------------------------------
select pg_temp.login('33333333-3333-3333-3333-333333333333');
select throws_ok(
  $$select public.send_friend_request('33333333-3333-3333-3333-333333333333')$$,
  'P0001', null,
  'cannot send a friend request to yourself');
select lives_ok(
  $$select public.send_friend_request('22222222-2222-2222-2222-222222222222')$$,
  'u3 can send u2 a friend request');
select is(
  (select status from public.friendships
   where requester = '33333333-3333-3333-3333-333333333333'
     and addressee = '22222222-2222-2222-2222-222222222222'),
  'pending',
  'the request landed as a pending row');

-- ---------------------------------------------------------------------------
-- friend request notifications, and the mutual-request-becomes-accept path
-- ---------------------------------------------------------------------------
select pg_temp.login('22222222-2222-2222-2222-222222222222');
select is(
  (select count(*)::int from public.notifications
   where user_id = '22222222-2222-2222-2222-222222222222'
     and actor_id = '33333333-3333-3333-3333-333333333333'
     and kind = 'friend_request'),
  1,
  'u2 was notified of u3''s friend request');

select lives_ok(
  $$select public.send_friend_request('33333333-3333-3333-3333-333333333333')$$,
  'u2 sending a request back to u3, who already asked, does not error');

select is(
  (select status from public.friendships
   where requester = '33333333-3333-3333-3333-333333333333'
     and addressee = '22222222-2222-2222-2222-222222222222'),
  'accepted',
  'the mutual request auto-accepted the original row instead of creating a duplicate');

select is(
  (select count(*)::int from public.friendships
   where (requester = '22222222-2222-2222-2222-222222222222' and addressee = '33333333-3333-3333-3333-333333333333')
      or (requester = '33333333-3333-3333-3333-333333333333' and addressee = '22222222-2222-2222-2222-222222222222')),
  1,
  'still only one friendship row between u2 and u3, not a mirrored pair');

select is(
  (select count(*)::int from public.notifications
   where user_id = '22222222-2222-2222-2222-222222222222'
     and actor_id = '33333333-3333-3333-3333-333333333333'
     and kind = 'friend_request'),
  0,
  'accepting clears the friend request notification');

select pg_temp.login('33333333-3333-3333-3333-333333333333');
select isnt(
  (select count(*)::int from public.search_profiles('user')),
  0,
  'search_profiles finds the fixture users by a substring of their username');
select is(
  (select count(*)::int from public.search_profiles('user') where id = '33333333-3333-3333-3333-333333333333'),
  0,
  'search_profiles never returns the caller themselves');

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
