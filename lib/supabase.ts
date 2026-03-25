import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
// For GitHub Pages, these can be public (anon key is safe to expose)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create Supabase client only when config is available.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database type for leaderboard table
export interface DatabaseLeaderboardEntry {
  id: string;
  name: string;
  score: number;
  timestamp: string; // ISO string from database
  skills_encountered: string[];
}
