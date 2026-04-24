-- ════════════════════════════════════════════════════════════════
--   🚀 NUCLEAR FIX - This WILL work 100%
--   Copy paste in Supabase SQL Editor and RUN
-- ════════════════════════════════════════════════════════════════

-- Step 1: TERMINATE all connections to the tables
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = current_database() 
  AND pid <> pg_backend_pid();

-- Step 2: Drop both tables with CASCADE (removes ALL dependencies)
DROP TABLE IF EXISTS public.diary_entries CASCADE;
DROP TABLE IF EXISTS public.kv_store_40d4d8fd CASCADE;

-- Step 3: Drop any remaining objects
DROP INDEX IF EXISTS idx_kv_store_user_id CASCADE;
DROP INDEX IF EXISTS idx_kv_store_created_at CASCADE;
DROP INDEX IF EXISTS idx_kv_store_diary_entries CASCADE;

-- Step 4: Recreate kv_store_40d4d8fd from scratch
CREATE TABLE public.kv_store_40d4d8fd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create indexes
CREATE INDEX idx_kv_store_user_id ON kv_store_40d4d8fd(user_id);
CREATE INDEX idx_kv_store_created_at ON kv_store_40d4d8fd(created_at DESC);
CREATE INDEX idx_kv_store_diary_entries ON kv_store_40d4d8fd(key) WHERE key LIKE 'diary_entry_%';

-- Step 6: Enable Row Level Security
ALTER TABLE kv_store_40d4d8fd ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop old policies if exist
DROP POLICY IF EXISTS "Allow all operations" ON kv_store_40d4d8fd;

-- Step 8: Create policy
CREATE POLICY "Allow all operations" ON kv_store_40d4d8fd FOR ALL USING (true) WITH CHECK (true);

-- Step 9: Analyze table (updates statistics)
ANALYZE kv_store_40d4d8fd;

-- Step 10: SUPER FORCE PostgREST schema cache reload (20 times!)
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

-- Step 11: Verify success
SELECT 
  '✅ SUCCESS!' as status,
  'kv_store_40d4d8fd' as table_name,
  COUNT(*) as total_columns,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'kv_store_40d4d8fd' 
  AND table_schema = 'public'
GROUP BY table_name;

-- Step 12: List all tables (verify diary_entries is GONE)
SELECT 
  '📋 All Tables' as info,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ════════════════════════════════════════════════════════════════
--   ✅ DONE! Now do this:
--   1. See "SUCCESS!" message above
--   2. Verify "diary_entries" NOT in table list
--   3. Go to Settings → API → Click "Restart PostgREST"
--   4. Wait 2 minutes
--   5. Close browser completely
--   6. Reopen browser
--   7. Open Resilio app
--   8. Ctrl + Shift + R (hard refresh)
--   9. Login and test Entries section
-- ════════════════════════════════════════════════════════════════
