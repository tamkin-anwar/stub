-- check_rate_limit compared window_start against now(), which is frozen to
-- the *transaction's* start time in Postgres, not wall-clock time. Any
-- single transaction that made more than one rate-limited call would never
-- see its own window roll over, no matter how much real time passed inside
-- it — caught by the pgTAP suite wrapping the whole file in one transaction
-- and pg_sleep()-ing past the window, but it's a real bug independent of
-- that: a client library that batches calls into one transaction would hit
-- it too. clock_timestamp() reads the actual wall clock on every call.

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
    insert into public.rate_limits (user_id, bucket, window_start, count) values (me, p_bucket, clock_timestamp(), 1);
    return;
  end if;

  if rec.window_start < clock_timestamp() - (p_window_seconds || ' seconds')::interval then
    update public.rate_limits set window_start = clock_timestamp(), count = 1
      where user_id = me and bucket = p_bucket;
    return;
  end if;

  if rec.count >= p_max then
    raise exception 'Too many requests. Wait a few minutes and try again.' using errcode = '42901';
  end if;

  update public.rate_limits set count = count + 1 where user_id = me and bucket = p_bucket;
end;
$$;
