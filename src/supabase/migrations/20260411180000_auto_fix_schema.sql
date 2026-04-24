-- AUTO FIX SCHEMA - Automatic migration on deployment
-- This will run automatically when Edge Function deploys
-- Timestamp: 2026-04-11 18:00

-- Step 1: Clean up old tables
DROP TABLE IF EXISTS public.diary_entries CASCADE;

-- Step 2: Ensure kv_store_40d4d8fd exists with correct schema
CREATE TABLE IF NOT EXISTS public.kv_store_40d4d8fd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_kv_store_user_id ON public.kv_store_40d4d8fd(user_id);
CREATE INDEX IF NOT EXISTS idx_kv_store_created_at ON public.kv_store_40d4d8fd(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kv_store_diary_entries ON public.kv_store_40d4d8fd(key) WHERE key LIKE 'diary_entry_%';

-- Step 4: Enable RLS
ALTER TABLE public.kv_store_40d4d8fd ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policy
DROP POLICY IF EXISTS "Allow all operations" ON public.kv_store_40d4d8fd;
CREATE POLICY "Allow all operations" ON public.kv_store_40d4d8fd FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Refresh statistics
ANALYZE public.kv_store_40d4d8fd;

-- Step 7: Force PostgREST cache reload (50 times for guaranteed refresh)
DO $$
BEGIN
  FOR i IN 1..50 LOOP
    PERFORM pg_notify('pgrst', 'reload schema');
    PERFORM pg_sleep(0.1); -- Small delay between notifications
  END LOOP;
END $$;

-- Step 8: Verify table exists
DO $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'kv_store_40d4d8fd'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE EXCEPTION 'Table kv_store_40d4d8fd was not created!';
  END IF;
  
  RAISE NOTICE 'Table kv_store_40d4d8fd verified successfully';
END $$;
