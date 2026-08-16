# Supabase Leaderboard Setup Guide

Scores are written only by the `submit-score` Edge Function, never by the
browser. See [SECURITY.md](SECURITY.md) for why, and for the full threat model.

## Step 1: Create the database table

If the table does not exist yet, run this in the Supabase SQL Editor:

```sql
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  skills_encountered TEXT[] DEFAULT '{}' NOT NULL
);

CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
```

Do **not** add RLS policies here — step 2 handles that.

## Step 2: Apply the lockdown migration

Run [`supabase/migrations/20260816000000_lockdown_leaderboard.sql`](supabase/migrations/20260816000000_lockdown_leaderboard.sql)
in the SQL Editor (paste the whole file), or with the CLI:

```bash
supabase db push
```

This creates the `game_sessions` table, drops every existing leaderboard policy
and replaces them with read-only public access, revokes the client's write
grants, and adds shape constraints. It is idempotent — safe to re-run.

Sections 5 and 6 of the migration are commented out on purpose: section 5 is the
cleanup for the injected row, which you should review before running.

## Step 3: Deploy the Edge Functions

The CLI does not need to be installed — `npx` fetches a prebuilt binary. Prefer
this over `brew install supabase/tap/supabase`, which builds from source and
fails if your Xcode Command Line Tools are out of date.

```bash
alias supabase="npx --yes supabase@latest"   # this shell session only

supabase login
supabase link --project-ref gtwlkxmezypafqferpow
supabase functions deploy start-game
supabase functions deploy submit-score
```

The project ref is the subdomain of your `VITE_SUPABASE_URL`. Note there are no
angle brackets around it — zsh reads `<` as a redirect and errors out.

Set the secrets — `CLIENT_HASH_SALT` matters, the rest have working defaults:

```bash
supabase secrets set \
  CLIENT_HASH_SALT="$(openssl rand -hex 32)" \
  ALLOWED_ORIGINS="https://owenchen07.github.io,http://localhost:3000"
```

The full list of tunable secrets is in [SECURITY.md](SECURITY.md#configuration).

## Step 4: Credentials

1. Supabase dashboard → **Settings** → **API**
2. Copy the **Project URL** and the **anon/public key**

The anon key is safe to expose — after step 2 it can only read the leaderboard.
The **service role key must never** go into `.env` or the bundle; Edge Functions
receive it automatically.

## Step 5: Environment variables

Local development — create `.env.local`:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

The `VITE_` prefix is required for Vite to expose these to the client.

For GitHub Pages, add the same two as repository secrets so the Actions build
can inject them: repo → Settings → Secrets and variables → Actions → New
repository secret.

If these are missing, the deployed site shows: "Supabase is not configured. Set
VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time."

## Step 6: Verify

Play a game and submit a score — it should appear on the board as before.

Then confirm the hole is actually closed. This is the request that let someone
inject a score; it must now fail:

```bash
curl -i -X POST "$VITE_SUPABASE_URL/rest/v1/leaderboard" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"XX","score":999999,"skills_encountered":[]}'
```

Expect `401` or `403` with a permission-denied message. If it returns `201`,
step 2 did not apply.

Reads should still work:

```bash
curl -s "$VITE_SUPABASE_URL/rest/v1/leaderboard?select=name,score&limit=3" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"
```

And a forged submission with no real session must be rejected:

```bash
curl -i -X POST "$VITE_SUPABASE_URL/functions/v1/submit-score" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"00000000-0000-4000-8000-000000000000","name":"XX","score":999999,"skillsEncountered":[]}'
```

Expect `403` — "This game session is no longer valid."
