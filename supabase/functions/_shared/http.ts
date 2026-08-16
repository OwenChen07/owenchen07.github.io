// Shared HTTP helpers for the leaderboard Edge Functions.

// Comma-separated list, e.g. "https://owenchen07.github.io,http://localhost:5173".
// If unset, falls back to "*" so local development works before you configure it.
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function corsHeaders(origin: string | null): Record<string, string> {
  let allowOrigin: string;
  if (ALLOWED_ORIGINS.length === 0) {
    allowOrigin = '*';
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    allowOrigin = origin;
  } else {
    allowOrigin = ALLOWED_ORIGINS[0];
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

export function json(
  body: unknown,
  status: number,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

/**
 * Stable, non-reversible per-client identifier used for rate limiting.
 * Hashed with a secret salt so the sessions table never stores raw IPs.
 */
export async function clientHash(req: Request): Promise<string> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('cf-connecting-ip') ??
    'unknown';
  const salt = Deno.env.get('CLIENT_HASH_SALT') ?? 'unsalted';
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
