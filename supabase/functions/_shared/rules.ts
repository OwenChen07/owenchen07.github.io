// Server-side rules for what counts as a plausible Dodge My Skills result.
// These are the authority — the browser copy of the game is untrusted input.

/** Must stay in sync with SKILLS in constants.tsx. */
export const SKILL_NAMES = new Set([
  'Python',
  'C',
  'C++',
  'TypeScript',
  'JS',
  'HTML',
  'CSS',
  'SQL',
  'PHP',
  'React',
  'Express',
  'GraphQL',
  'Flask',
  'Laravel',
  'Tailwind',
  'Docker',
  'Podman',
  'Kubernetes',
  'OpenStack',
  'MCP',
  'Git',
  'GitLab',
  'Robot Framework',
  'Sequelize',
  'PyTorch',
  'NumPy',
  'OpenAI',
  'Cursor',
  'Claude Code',
]);

const num = (name: string, fallback: number) => {
  const raw = Deno.env.get(name);
  const parsed = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Absolute ceiling on a displayed score, regardless of elapsed time. */
export const MAX_SCORE = num('MAX_SCORE', 50_000);

/**
 * Fastest rate at which the displayed score can legitimately climb.
 *
 * The game adds 1 raw point per requestAnimationFrame and displays
 * floor(raw / 10), so the rate is the monitor's refresh rate / 10:
 * 6/sec at 60Hz, 14.4/sec at 144Hz, 24/sec at 240Hz. The default of 26
 * leaves headroom for the fastest displays plus timing jitter.
 *
 * Lower this (via the MAX_POINTS_PER_SECOND secret) to tighten the check —
 * but only after making score accrual time-based rather than frame-based,
 * otherwise you will start rejecting real players on high-refresh monitors.
 */
export const MAX_POINTS_PER_SECOND = num('MAX_POINTS_PER_SECOND', 26);

/** Slack for clock skew and the round trip between game over and submit. */
export const TIMING_SLACK_SECONDS = num('TIMING_SLACK_SECONDS', 3);

/** A session token is only good for this long after start-game issued it. */
export const SESSION_MAX_AGE_SECONDS = num('SESSION_MAX_AGE_SECONDS', 3 * 60 * 60);

/** Per-client hourly caps. */
export const SESSIONS_PER_HOUR = num('SESSIONS_PER_HOUR', 60);
export const SUBMISSIONS_PER_HOUR = num('SUBMISSIONS_PER_HOUR', 20);

export interface ParsedSubmission {
  sessionId: string;
  name: string;
  score: number;
  skillsEncountered: string[];
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate the shape of a submission body. Returns either the cleaned
 * submission or a human-readable reason it was rejected.
 *
 * Note that the client's idea of "when" is not accepted at all: the row's
 * timestamp comes from the database default, so a forged future timestamp
 * cannot be used to camp the "Last 7 Days" board.
 */
export function parseSubmission(
  body: unknown,
): { ok: true; value: ParsedSubmission } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Malformed request body.' };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.sessionId !== 'string' || !UUID_RE.test(b.sessionId)) {
    return { ok: false, error: 'Missing or malformed session id.' };
  }

  if (typeof b.name !== 'string') {
    return { ok: false, error: 'Missing initials.' };
  }
  const name = b.name.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(name)) {
    return { ok: false, error: 'Initials must be exactly two letters.' };
  }

  if (typeof b.score !== 'number' || !Number.isInteger(b.score)) {
    return { ok: false, error: 'Score must be a whole number.' };
  }
  if (b.score < 0 || b.score > MAX_SCORE) {
    return { ok: false, error: 'Score out of range.' };
  }

  const rawSkills = b.skillsEncountered;
  if (rawSkills !== undefined && !Array.isArray(rawSkills)) {
    return { ok: false, error: 'Malformed skills list.' };
  }
  const skills = Array.from(
    new Set(
      ((rawSkills ?? []) as unknown[]).filter(
        (s): s is string => typeof s === 'string' && SKILL_NAMES.has(s),
      ),
    ),
  ).sort();

  return { ok: true, value: { sessionId: b.sessionId, name, score: b.score, skillsEncountered: skills } };
}

/** Shortest wall-clock time in which the given score could have been reached. */
export function minimumSecondsFor(score: number): number {
  return score / MAX_POINTS_PER_SECOND - TIMING_SLACK_SECONDS;
}
