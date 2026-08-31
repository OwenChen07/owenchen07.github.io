# Leaderboard security

## Why RLS alone could not fix this

The site is static and served from GitHub Pages. The Supabase URL and anon key
are compiled into the JavaScript bundle, which means they are public — that is
by design, and rotating them changes nothing.

The consequence is that a real player's browser and a `curl` command are
indistinguishable at the database. Both arrive as the `anon` role, holding the
same key, with a payload the sender fully controls. Row Level Security decides
*which rows a role may write*; it cannot decide *whether the sender played a
game*, because nothing in the request carries that information.

That is why the original policy was

```sql
CREATE POLICY "Anyone can insert into leaderboard"
  ON leaderboard FOR INSERT TO anon WITH CHECK (true);
```

`WITH CHECK (true)` accepts everything, so it was exactly equivalent to having
no protection at all. And any stricter predicate — a score cap, an auth check —
rejects real players just as readily as the attacker, which is the failure mode
you hit when you tightened it.

## The fix

The browser no longer has insert privileges on `leaderboard` at all. Writes go
through two Edge Functions that run on Supabase's servers with the service-role
key, which is never shipped to the client.

```
  Browser                       Edge Function              Database
  ───────                       ─────────────              ────────
  Play pressed  ──────────────> start-game
                                  rate-limit by IP hash
                                  insert session ────────> game_sessions
                <── sessionId ──  (created_at = server clock)

  ...player actually plays the game...

  Submit  ─────────────────────> submit-score
   {sessionId, name,               validate shape
    score, skills}                 claim session atomically
                                   check elapsed vs. score
                                   rate-limit by IP hash
                                   insert ───────────────> leaderboard
                <── ok ──────────  (timestamp = server clock)
```

`anon` keeps `SELECT` and nothing else, enforced two ways: no insert/update/
delete policy exists under RLS, *and* the table grants are revoked so PostgREST
rejects a write on privileges before it ever reaches a policy.

### What each check stops

| Check | Attack it closes |
| --- | --- |
| No insert grant or policy for `anon` | Posting a row straight to the PostgREST endpoint with the public key — the original attack |
| Session id required, single-use | Replaying one captured submission over and over |
| Session id is a server-generated UUID | Forging a token without calling `start-game` |
| Elapsed time ≥ score ÷ max rate | Claiming a huge score instantly |
| Server sets `timestamp` | Backdating or postdating a row to camp "Last 7 Days" |
| `session_id` unique index | Two rows from one game, even if the function is buggy |
| Skills validated against an allowlist | Injecting arbitrary strings into `skills_encountered` |
| `name ~ '^[A-Z]{2}$'` in code and as a constraint | Stuffing long or markup-bearing display names into the board |
| Per-IP-hash hourly caps | Bulk-flooding the table |
| IP stored only as a salted SHA-256 | Keeping raw player IPs out of the database |

### What this does *not* stop

Worth being clear about, since you asked about "any attack":

**A patient attacker can still submit a plausible fake score.** They can call
`start-game`, wait the required number of seconds without playing, and submit a
score consistent with that wait. The rate limits and the required wait make this
tedious and slow rather than impossible — a score of 5,000 costs them a bit over
three minutes of waiting per attempt, and 20 attempts per hour.

Closing that last gap requires the server to be able to *verify the game itself*,
which means making the simulation deterministic (seeded RNG, fixed timestep),
having the client submit its input log, and replaying it server-side to confirm
the score. That is a real rewrite of the game loop, and it is the only thing that
makes cheating genuinely infeasible. For a portfolio leaderboard, the current
tier is the usual place to stop.

**Score accrual is tied to monitor refresh rate.** The game does
`scoreRef.current += 1` inside `requestAnimationFrame`, so a 144Hz display earns
points 2.4× faster than a 60Hz one. That is a fairness bug on its own, and it
also forces the timing check to be loose: `MAX_POINTS_PER_SECOND` defaults to 26
to accommodate 240Hz displays, when 60Hz play only produces 6/sec. Making score
time-based (accumulate elapsed milliseconds rather than frames) would fix the
fairness issue and let you drop the limit to ~7, tightening the check roughly
four-fold. Left alone for now since it changes game balance and makes existing
leaderboard entries non-comparable — your call.

## Configuration

Set these as Edge Function secrets (Dashboard → Edge Functions → Secrets, or
`supabase secrets set`). All are optional except `CLIENT_HASH_SALT`.

| Secret | Default | Purpose |
| --- | --- | --- |
| `CLIENT_HASH_SALT` | `unsalted` | Salt for the IP hash. **Set this** to any long random string. |
| `ALLOWED_ORIGINS` | `*` | Comma-separated origin allowlist for CORS, e.g. `https://owenchen07.me,http://localhost:3000`. |
| `MAX_SCORE` | `50000` | Absolute score ceiling. |
| `MAX_POINTS_PER_SECOND` | `26` | Fastest legitimate score accrual. See the refresh-rate note above before lowering. |
| `TIMING_SLACK_SECONDS` | `3` | Tolerance for network latency and clock skew. |
| `SESSION_MAX_AGE_SECONDS` | `10800` | How long a session token stays valid. |
| `SESSIONS_PER_HOUR` | `60` | Games startable per IP hash per hour. |
| `SUBMISSIONS_PER_HOUR` | `20` | Scores submittable per IP hash per hour. |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically; do
not set them yourself.

## Deploying

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the step-by-step.

## Unrelated note: `.env` is committed

`.env` is listed in `.gitignore` but was added to the repo before that rule
existed, so it is still tracked and its contents are in the git history. The
only things in it are the Supabase URL and anon key, both of which are public by
design and already visible in the built bundle — so nothing is leaked. It is
still worth untracking so a future secret does not get committed by reflex:

```bash
git rm --cached .env
git commit -m "Stop tracking .env"
```
