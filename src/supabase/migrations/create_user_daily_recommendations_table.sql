-- Create user_daily_recommendations table
-- This table stores daily wellness recommendations for each user
-- Each user gets a unique random recommendation per day

CREATE TABLE IF NOT EXISTS user_daily_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id INTEGER NOT NULL,
  recommendation_text TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one recommendation per user per day
  UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_daily_recommendations_user_date 
ON user_daily_recommendations(user_id, date);

-- Enable Row Level Security
ALTER TABLE user_daily_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own recommendations
CREATE POLICY "Users can view own daily recommendations"
ON user_daily_recommendations
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own recommendations
CREATE POLICY "Users can insert own daily recommendations"
ON user_daily_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recommendations
CREATE POLICY "Users can update own daily recommendations"
ON user_daily_recommendations
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own recommendations
CREATE POLICY "Users can delete own daily recommendations"
ON user_daily_recommendations
FOR DELETE
USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE user_daily_recommendations IS 'Stores daily wellness recommendations for each user. Each user gets one random recommendation per day.';

-- Add comments to columns
COMMENT ON COLUMN user_daily_recommendations.user_id IS 'Reference to the user who owns this recommendation';
COMMENT ON COLUMN user_daily_recommendations.recommendation_id IS 'ID of the recommendation (1-96)';
COMMENT ON COLUMN user_daily_recommendations.recommendation_text IS 'The actual recommendation text';
COMMENT ON COLUMN user_daily_recommendations.date IS 'Date for which this recommendation is valid';
COMMENT ON COLUMN user_daily_recommendations.created_at IS 'Timestamp when recommendation was created';
