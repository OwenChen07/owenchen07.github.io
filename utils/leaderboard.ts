import { LeaderboardEntry } from '../types';
import { supabase, isSupabaseConfigured, DatabaseLeaderboardEntry } from '../lib/supabase';

const MAX_LEADERBOARD_ENTRIES = 10;

export interface PaginatedLeaderboardResult {
  entries: LeaderboardEntry[];
  totalCount: number;
  error?: string;
}

/**
 * Convert database entry to app entry format
 */
const dbToAppEntry = (dbEntry: DatabaseLeaderboardEntry): LeaderboardEntry => ({
  name: dbEntry.name,
  score: dbEntry.score,
  timestamp: new Date(dbEntry.timestamp).getTime(),
  skillsEncountered: dbEntry.skills_encountered || [],
});

/**
 * Get all leaderboard entries from Supabase
 */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return (data || []).map(dbToAppEntry);
  } catch (error) {
    console.error('Error reading leaderboard from Supabase:', error);
    return [];
  }
};

/**
 * Pull the error message out of a failed functions.invoke() call.
 * supabase-js surfaces non-2xx responses as a FunctionsHttpError whose body
 * has to be read off error.context, so the useful message is one await away.
 */
const readFunctionError = async (error: unknown, fallback: string): Promise<string> => {
  const context = (error as { context?: Response })?.context;
  if (context && typeof context.json === 'function') {
    try {
      const body = await context.json();
      if (body && typeof body.error === 'string') {
        return body.error;
      }
    } catch {
      // Body was not JSON; fall through to the generic message.
    }
  }
  return error instanceof Error ? error.message : fallback;
};

/**
 * Open a server-side game session and return its id.
 *
 * The id is the proof-of-play token that saveLeaderboardEntry must present.
 * Returns null if a session could not be opened, in which case the score
 * simply cannot be submitted — the browser has no write access of its own.
 */
export const startGameSession = async (): Promise<string | null> => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.functions.invoke('start-game', {
      body: {},
    });

    if (error) {
      console.error('Error starting game session:', await readFunctionError(error, 'Unknown error'));
      return null;
    }

    return typeof data?.sessionId === 'string' ? data.sessionId : null;
  } catch (error) {
    console.error('Error starting game session:', error);
    return null;
  }
};

/**
 * Submit a leaderboard entry through the submit-score Edge Function.
 *
 * The browser holds no insert privilege on the leaderboard table, so this is
 * the only way a score can be written. The server validates the session and
 * stamps the row's timestamp itself; entry.timestamp is not sent.
 */
export const saveLeaderboardEntry = async (
  entry: LeaderboardEntry,
  sessionId: string | null,
): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Leaderboard is not configured.');
  }

  if (!sessionId) {
    throw new Error('This game could not be verified, so the score cannot be saved.');
  }

  const { error } = await supabase.functions.invoke('submit-score', {
    body: {
      sessionId,
      name: entry.name,
      score: entry.score,
      skillsEncountered: entry.skillsEncountered,
    },
  });

  if (error) {
    const message = await readFunctionError(error, 'Could not save your score.');
    console.error('Error saving leaderboard entry:', message);
    throw new Error(message);
  }
};

/**
 * Get top N entries from leaderboard
 */
export const getTopEntries = async (count: number = MAX_LEADERBOARD_ENTRIES): Promise<LeaderboardEntry[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('timestamp', { ascending: true })
      .limit(count);

    if (error) {
      console.error('Error fetching top entries:', error);
      return [];
    }

    return (data || []).map(dbToAppEntry);
  } catch (error) {
    console.error('Error reading top entries from Supabase:', error);
    return [];
  }
};

/**
 * Get top N entries from leaderboard within the last N days
 */
export const getTopEntriesLastDays = async (
  days: number = 7,
  count: number = MAX_LEADERBOARD_ENTRIES
): Promise<LeaderboardEntry[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .gte('timestamp', cutoffDate.toISOString())
      .order('score', { ascending: false })
      .order('timestamp', { ascending: true })
      .limit(count);

    if (error) {
      console.error(`Error fetching top entries from last ${days} days:`, error);
      return [];
    }

    return (data || []).map(dbToAppEntry);
  } catch (error) {
    console.error(`Error reading top entries from last ${days} days from Supabase:`, error);
    return [];
  }
};

/**
 * Get paginated leaderboard entries
 */
export const getPaginatedEntries = async (
  page: number = 1,
  entriesPerPage: number = MAX_LEADERBOARD_ENTRIES
): Promise<PaginatedLeaderboardResult> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      entries: [],
      totalCount: 0,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time.',
    };
  }

  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching leaderboard count:', countError);
    }

    // Get paginated entries
    const from = (page - 1) * entriesPerPage;
    const to = from + entriesPerPage - 1;

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('timestamp', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching paginated entries:', error);
      return {
        entries: [],
        totalCount: count || 0,
        error: error.message || 'Failed to fetch leaderboard entries.',
      };
    }

    return {
      entries: (data || []).map(dbToAppEntry),
      totalCount: count || 0,
      error: countError?.message,
    };
  } catch (error) {
    console.error('Error reading paginated entries from Supabase:', error);
    return {
      entries: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown leaderboard error.',
    };
  }
};

/**
 * Check if a score would make it to the leaderboard
 */
export const isHighScore = async (score: number): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  try {
    // Get current leaderboard count and lowest score
    const { data, error } = await supabase
      .from('leaderboard')
      .select('score')
      .order('score', { ascending: false })
      .limit(MAX_LEADERBOARD_ENTRIES);

    if (error) {
      console.error('Error checking high score:', error);
      // If we can't check, assume it's a high score to allow the user
      return true;
    }

    // If leaderboard has less than max entries, any score qualifies
    if (!data || data.length < MAX_LEADERBOARD_ENTRIES) {
      return true;
    }

    // Check if score is higher than the lowest score in leaderboard
    const lowestScore = data[data.length - 1]?.score ?? 0;
    return score > lowestScore;
  } catch (error) {
    console.error('Error checking if high score:', error);
    return true; // Default to true if check fails
  }
};

/**
 * Format timestamp to readable date string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};
