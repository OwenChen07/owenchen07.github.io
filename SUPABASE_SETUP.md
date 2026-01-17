# Supabase Leaderboard Setup Guide

## Step 1: Create the Database Table

In your Supabase dashboard (dodge_leaderboard project):

1. Go to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Paste this SQL to create the table:

```sql
-- Create leaderboard table
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  skills_encountered TEXT[] DEFAULT '{}' NOT NULL
);

-- Create index on score for faster queries
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read leaderboard
CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policy to allow anyone to insert (for public leaderboard)
CREATE POLICY "Anyone can insert into leaderboard"
  ON leaderboard FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

4. Click **Run** to execute the SQL

## Step 2: Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key under "Project API keys")

## Step 3: Install Supabase Client

Run in your project directory:
```bash
npm install @supabase/supabase-js
```

## Step 4: Set Up Environment Variables

For local development:
1. Create/update `.env.local` file in your project root
2. Add:
```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Note:** The `VITE_` prefix is required for Vite to expose these to the client.

For GitHub Pages:
- These will need to be public (in the built code)
- Alternative: Create a `config.ts` file (we'll set this up)

## Step 5: Code Changes

The code has been updated to use Supabase. After setting up the table and env vars, test locally first!
