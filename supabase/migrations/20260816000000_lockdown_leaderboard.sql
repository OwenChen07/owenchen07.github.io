-- Lock down the leaderboard so scores can only be written by the
-- submit-score Edge Function (which runs with the service_role key).
--
-- Run this in the Supabase SQL Editor, or via `supabase db push`.
-- It is written to be idempotent: re-running it is safe.

-- ---------------------------------------------------------------------------
-- 1. Game sessions: server-side proof that a game was actually started
-- ---------------------------------------------------------------------------
-- start-game inserts a row here and returns its id. submit-score requires a
-- valid, unused, not-yet-expired session id, and uses this table's created_at
-- (server clock, not the browser's) to check the score is time-plausible.

create table if not exists public.game_sessions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  used_at     timestamptz,
  client_hash text not null,
  user_agent  text
);

create index if not exists idx_game_sessions_client_created
  on public.game_sessions (client_hash, created_at desc);
create index if not exists idx_game_sessions_client_used
  on public.game_sessions (client_hash, used_at desc);

-- No policies are created for this table, so with RLS on, anon and
-- authenticated can read/write exactly nothing. service_role bypasses RLS.
alter table public.game_sessions enable row level security;
revoke all on public.game_sessions from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Link each leaderboard row to the session that earned it
-- ---------------------------------------------------------------------------
-- The unique constraint makes "one score per game" a database invariant, not
-- just an application check. Nullable so pre-existing rows stay valid.

alter table public.leaderboard
  add column if not exists session_id uuid references public.game_sessions(id);

create unique index if not exists idx_leaderboard_session_id
  on public.leaderboard (session_id);

-- ---------------------------------------------------------------------------
-- 3. Leaderboard: public read, no client writes
-- ---------------------------------------------------------------------------

alter table public.leaderboard enable row level security;

-- Start from a known state — drop whatever policies are currently on the
-- table, including the half-finished ones that broke inserts.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'leaderboard'
  loop
    execute format('drop policy %I on public.leaderboard', pol.policyname);
  end loop;
end $$;

-- The only thing the browser may do is read.
create policy "leaderboard_public_read"
  on public.leaderboard for select
  to anon, authenticated
  using (true);

-- Deliberately NO insert/update/delete policy: under RLS, no matching policy
-- means denied.

-- Belt and braces. Supabase grants ALL on new public tables to anon and
-- authenticated by default; without this revoke, the only thing standing
-- between the public key and a write is the policy set above. With it,
-- PostgREST rejects writes on privileges before RLS is even consulted.
revoke all on public.leaderboard from anon, authenticated;
grant select on public.leaderboard to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Shape constraints, enforced even on the service_role path
-- ---------------------------------------------------------------------------
-- Added NOT VALID so that any junk already in the table does not block the
-- migration. New and updated rows are still checked. See step 5 to clean up
-- and validate.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'leaderboard_name_format') then
    alter table public.leaderboard
      add constraint leaderboard_name_format check (name ~ '^[A-Z]{2}$') not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'leaderboard_score_range') then
    alter table public.leaderboard
      add constraint leaderboard_score_range check (score >= 0 and score <= 100000) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'leaderboard_skills_len') then
    alter table public.leaderboard
      add constraint leaderboard_skills_len
      check (coalesce(array_length(skills_encountered, 1), 0) <= 32) not valid;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Cleanup (manual — review before running)
-- ---------------------------------------------------------------------------
-- Find rows that could not have come from a real game:
--
--   select * from public.leaderboard
--   where name !~ '^[A-Z]{2}$'
--      or score < 0 or score > 100000
--      or timestamp > now()
--   order by score desc;
--
-- Delete the injected entry (substitute the real id), then promote the
-- constraints from NOT VALID to fully enforced:
--
--   delete from public.leaderboard where id = '...';
--   alter table public.leaderboard validate constraint leaderboard_name_format;
--   alter table public.leaderboard validate constraint leaderboard_score_range;
--   alter table public.leaderboard validate constraint leaderboard_skills_len;

-- ---------------------------------------------------------------------------
-- 6. Optional: prune old sessions (requires the pg_cron extension)
-- ---------------------------------------------------------------------------
--   select cron.schedule('prune-game-sessions', '0 4 * * *', $$
--     delete from public.game_sessions
--     where created_at < now() - interval '7 days'
--       and id not in (select session_id from public.leaderboard where session_id is not null)
--   $$);
