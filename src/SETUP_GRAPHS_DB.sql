-- ================================================================
-- Resilio: Games & Exercise Graphs - Database Setup
-- ================================================================
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================================

-- Table 1: Games Activity Tracking
CREATE TABLE IF NOT EXISTS games_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  game_name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_activity_user_id ON games_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_games_activity_created_at ON games_activity(created_at);

-- Table 2: Exercise Activity Tracking
CREATE TABLE IF NOT EXISTS exercise_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  video_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_activity_user_id ON exercise_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_activity_created_at ON exercise_activity(created_at);

-- Enable RLS
ALTER TABLE games_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_activity ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own games" ON games_activity;
DROP POLICY IF EXISTS "Users can insert own games" ON games_activity;
DROP POLICY IF EXISTS "Users can update own games" ON games_activity;

DROP POLICY IF EXISTS "Users can view own exercises" ON exercise_activity;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercise_activity;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercise_activity;

-- Create RLS Policies (fresh)
CREATE POLICY "Users can view own games" ON games_activity FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own games" ON games_activity FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own games" ON games_activity FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own exercises" ON exercise_activity FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own exercises" ON exercise_activity FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own exercises" ON exercise_activity FOR UPDATE USING (auth.uid()::text = user_id);

-- Verify
SELECT 'Tables created successfully! Policies refreshed!' AS status;
