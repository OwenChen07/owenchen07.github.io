// POST /functions/v1/start-game -> { sessionId }
//
// Records that a game began, on the server clock. The returned id is the
// capability the browser must hand back to submit-score; it is an unguessable
// random uuid, single-use, and its created_at is what bounds the score that
// session is allowed to claim.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { clientHash, corsHeaders, json } from '../_shared/http.ts';
import { SESSIONS_PER_HOUR } from '../_shared/rules.ts';

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, origin);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const hash = await clientHash(req);
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();

  const { count, error: countError } = await admin
    .from('game_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('client_hash', hash)
    .gte('created_at', oneHourAgo);

  if (countError) {
    console.error('start-game rate-limit check failed:', countError);
    return json({ error: 'Could not start a game session.' }, 500, origin);
  }
  if ((count ?? 0) >= SESSIONS_PER_HOUR) {
    return json(
      { error: 'Too many games started from here recently. Try again later.' },
      429,
      origin,
    );
  }

  const { data, error } = await admin
    .from('game_sessions')
    .insert({
      client_hash: hash,
      user_agent: req.headers.get('user-agent')?.slice(0, 200) ?? null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('start-game insert failed:', error);
    return json({ error: 'Could not start a game session.' }, 500, origin);
  }

  return json({ sessionId: data.id }, 200, origin);
});
