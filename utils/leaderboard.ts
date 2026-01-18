import { LeaderboardEntry } from '../types';
import { supabase, DatabaseLeaderboardEntry } from '../lib/supabase';

const MAX_LEADERBOARD_ENTRIES = 10;

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
 * Save a leaderboard entry to Supabase
 * Stores all entries in the database (no limit)
 */
export const saveLeaderboardEntry = async (entry: LeaderboardEntry): Promise<void> => {
  try {
    // Insert the new entry (no cleanup - store all entries)
    const { error } = await supabase
      .from('leaderboard')
      .insert({
        name: entry.name,
        score: entry.score,
        timestamp: new Date(entry.timestamp).toISOString(),
        skills_encountered: entry.skillsEncountered,
      });

    if (error) {
      console.error('Error saving leaderboard entry:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving leaderboard entry:', error);
    throw error;
  }
};

/**
 * Get top N entries from leaderboard
 */
export const getTopEntries = async (count: number = MAX_LEADERBOARD_ENTRIES): Promise<LeaderboardEntry[]> => {
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
 * Get paginated leaderboard entries
 */
export const getPaginatedEntries = async (
  page: number = 1,
  entriesPerPage: number = MAX_LEADERBOARD_ENTRIES
): Promise<{ entries: LeaderboardEntry[]; totalCount: number }> => {
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
      return { entries: [], totalCount: count || 0 };
    }

    return {
      entries: (data || []).map(dbToAppEntry),
      totalCount: count || 0,
    };
  } catch (error) {
    console.error('Error reading paginated entries from Supabase:', error);
    return { entries: [], totalCount: 0 };
  }
};

/**
 * Check if a score would make it to the leaderboard
 */
export const isHighScore = async (score: number): Promise<boolean> => {
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
