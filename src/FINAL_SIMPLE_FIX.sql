-- ════════════════════════════════════════════════════════════════
--   ✅ SIMPLE FIX (No SUPERUSER needed)
--   Copy paste in Supabase SQL Editor and RUN
-- ════════════════════════════════════════════════════════════════

-- Step 1: Drop both tables completely
DROP TABLE IF EXISTS public.diary_entries CASCADE;
DROP TABLE IF EXISTS public.kv_store_40d4d8fd CASCADE;

-- Step 2: Drop any remaining indexes
DROP INDEX IF EXISTS public.idx_kv_store_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_kv_store_created_at CASCADE;
DROP INDEX IF EXISTS public.idx_kv_store_diary_entries CASCADE;

-- Step 3: Recreate kv_store_40d4d8fd fresh
CREATE TABLE public.kv_store_40d4d8fd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX idx_kv_store_user_id ON public.kv_store_40d4d8fd(user_id);
CREATE INDEX idx_kv_store_created_at ON public.kv_store_40d4d8fd(created_at DESC);
CREATE INDEX idx_kv_store_diary_entries ON public.kv_store_40d4d8fd(key) WHERE key LIKE 'diary_entry_%';

-- Step 5: Enable RLS
ALTER TABLE public.kv_store_40d4d8fd ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop old policies
DROP POLICY IF EXISTS "Allow all operations" ON public.kv_store_40d4d8fd;

-- Step 7: Create policy
CREATE POLICY "Allow all operations" ON public.kv_store_40d4d8fd FOR ALL USING (true) WITH CHECK (true);

-- Step 8: Analyze table
ANALYZE public.kv_store_40d4d8fd;

-- Step 9: SUPER FORCE PostgREST schema cache reload (30 times!)
DO $$
BEGIN
  FOR i IN 1..30 LOOP
    NOTIFY pgrst, 'reload schema';
  END LOOP;
END $$;

-- Step 10: Verify success
SELECT 
  '✅ TABLE CREATED!' as status,
  'kv_store_40d4d8fd' as table_name,
  COUNT(*) as total_columns,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'kv_store_40d4d8fd' 
  AND table_schema = 'public'
GROUP BY table_name;

-- Step 11: Verify diary_entries is GONE
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ diary_entries DELETED!'
    ELSE '❌ diary_entries still exists'
  END as diary_entries_status
FROM information_schema.tables 
WHERE table_name = 'diary_entries' 
  AND table_schema = 'public';

-- Step 12: List all tables
SELECT 
  '📋 ALL TABLES IN DATABASE' as info,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ════════════════════════════════════════════════════════════════
--   ✅ DONE! Now do this:
--   1. See "TABLE CREATED!" and "diary_entries DELETED!" above
--   2. Go to Settings → API → Restart PostgREST
--   3. Wait 2 minutes
--   4. Clear browser cache (Ctrl+Shift+Delete)
--   5. Close browser completely
--   6. Reopen and hard refresh (Ctrl+Shift+R)
--   7. Login and test Entries section
-- ════════════════════════════════════════════════════════════════
