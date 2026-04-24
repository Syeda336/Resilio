-- FINAL SCHEMA FIX - Ensuring clean database state
-- Run: 2026-04-11 12:00

-- Drop diary_entries table if it exists
DROP TABLE IF EXISTS public.diary_entries CASCADE;

-- Ensure kv_store_40d4d8fd exists with correct schema
CREATE TABLE IF NOT EXISTS public.kv_store_40d4d8fd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_kv_store_user_id ON public.kv_store_40d4d8fd(user_id);
CREATE INDEX IF NOT EXISTS idx_kv_store_created_at ON public.kv_store_40d4d8fd(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kv_store_diary_entries ON public.kv_store_40d4d8fd(key) WHERE key LIKE 'diary_entry_%';

-- Enable Row Level Security
ALTER TABLE public.kv_store_40d4d8fd ENABLE ROW LEVEL SECURITY;

-- Drop old policy if exists
DROP POLICY IF EXISTS "Allow all operations" ON public.kv_store_40d4d8fd;

-- Create policy
CREATE POLICY "Allow all operations" ON public.kv_store_40d4d8fd FOR ALL USING (true) WITH CHECK (true);

-- Analyze table for statistics
ANALYZE public.kv_store_40d4d8fd;

-- Super force PostgREST schema cache reload
DO $$
BEGIN
  FOR i IN 1..20 LOOP
    PERFORM pg_notify('pgrst', 'reload schema');
  END LOOP;
END $$;
