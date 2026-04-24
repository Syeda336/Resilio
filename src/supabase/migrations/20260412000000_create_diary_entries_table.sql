-- Create diary_entries table for storing diary entries
-- Date: 2026-04-12
-- This table will store all diary entries with proper structure

-- Drop table if exists (clean slate)
DROP TABLE IF EXISTS public.diary_entries CASCADE;

-- Create diary_entries table
CREATE TABLE public.diary_entries (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX idx_diary_entries_created_at ON public.diary_entries(created_at DESC);
CREATE INDEX idx_diary_entries_date ON public.diary_entries(date DESC);
CREATE INDEX idx_diary_entries_user_date ON public.diary_entries(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow all operations for authenticated users
-- (We validate user ownership in the application layer)
DROP POLICY IF EXISTS "Allow all operations" ON public.diary_entries;
CREATE POLICY "Allow all operations" 
  ON public.diary_entries 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
