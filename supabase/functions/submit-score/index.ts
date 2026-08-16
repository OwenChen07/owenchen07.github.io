// POST /functions/v1/submit-score
//   body: { sessionId, name, score, skillsEncountered }
//
// The only path by which a row can reach the leaderboard table. Runs with the
// service_role key, which is never sent to the browser.
//
// A submission is accepted only if all of the following hold:
//   - the body is well formed and the initials/score/skills are in range
//   - the session id exists, has not already been redeemed, and is not expired
//   - enough wall-clock time has passed since start-game for the claimed score
//   - the client is under its hourly submission cap
//
// The row's timestamp comes from the database default, so the browser cannot
// backdate or postdate an entry.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { clientHash, corsHeaders, json } from '../_shared/http.ts';
import {
  minimumSecondsFor,
  parseSubmission,
  SESSION_MAX_AGE_SECONDS,
  SUBMISSIONS_PER_HOUR,
} from '../_shared/rules.ts';

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, origin);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Malformed request body.' }, 400, origin);
  }

  const parsed = parseSubmission(body);
  if (!parsed.ok) {
    return json({ error: parsed.error }, 400, origin);
  }
  const { sessionId, name, score, skillsEncountered } = parsed.value;

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const hash = await clientHash(req);
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();

  const { count: recent, error: rateError } = await admin
    .from('game_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('client_hash', hash)
    .gte('used_at', oneHourAgo);

  if (rateError) {
    console.error('submit-score rate-limit check failed:', rateError);
    return json({ error: 'Could not save your score.' }, 500, origin);
  }
  if ((recent ?? 0) >= SUBMISSIONS_PER_HOUR) {
    return json(
      { error: 'Too many scores submitted from here recently. Try again later.' },
      429,
      origin,
    );
  }

  // Claim the session atomically: `used_at is null` in the WHERE clause means
  // two concurrent submissions for the same session cannot both succeed.
  const { data: session, error: claimError } = await admin
    .from('game_sessions')
    .update({ used_at: new Date().toISOString() })
    .eq('id', sessionId)
    .is('used_at', null)
    .select('id, created_at')
    .maybeSingle();

  if (claimError) {
    console.error('submit-score session claim failed:', claimError);
    return json({ error: 'Could not save your score.' }, 500, origin);
  }
  if (!session) {
    // Either the id is bogus or the score for this game was already saved.
    return json(
      { error: 'This game session is no longer valid. Play again to submit a score.' },
      403,
      origin,
    );
  }

  const elapsedSeconds = (Date.now() - new Date(session.created_at).getTime()) / 1000;

  if (elapsedSeconds > SESSION_MAX_AGE_SECONDS) {
    return json(
      { error: 'This game session has expired. Play again to submit a score.' },
      403,
      origin,
    );
  }
  if (elapsedSeconds < minimumSecondsFor(score)) {
    console.warn(
      `Rejected implausible score: ${score} points in ${elapsedSeconds.toFixed(1)}s`,
    );
    return json({ error: 'That score could not be verified.' }, 403, origin);
  }

  const { error: insertError } = await admin.from('leaderboard').insert({
    name,
    score,
    skills_encountered: skillsEncountered,
    session_id: session.id,
    // timestamp intentionally omitted — the column default (now()) is the
    // server's clock, which the client cannot influence.
  });

  if (insertError) {
    console.error('submit-score insert failed:', insertError);
    return json({ error: 'Could not save your score.' }, 500, origin);
  }

  return json({ ok: true, score }, 200, origin);
});
