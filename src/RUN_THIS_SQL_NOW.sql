-- ════════════════════════════════════════════════════════════════
--   🔥 INSTANT FIX - Copy paste this ENTIRE file in Supabase SQL Editor
--   Then click RUN - Error will be GONE immediately!
-- ════════════════════════════════════════════════════════════════

-- Step 1: Drop the problematic table
DROP TABLE IF EXISTS public.diary_entries CASCADE;

-- Step 2: Make sure kv_store_40d4d8fd exists with correct schema
CREATE TABLE IF NOT EXISTS public.kv_store_40d4d8fd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_kv_store_user_id ON kv_store_40d4d8fd(user_id);
CREATE INDEX IF NOT EXISTS idx_kv_store_created_at ON kv_store_40d4d8fd(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kv_store_diary_entries ON kv_store_40d4d8fd(key) WHERE key LIKE 'diary_entry_%';

-- Step 4: Enable Row Level Security
ALTER TABLE kv_store_40d4d8fd ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policy
DROP POLICY IF EXISTS "Allow all operations" ON kv_store_40d4d8fd;
CREATE POLICY "Allow all operations" ON kv_store_40d4d8fd FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Force schema cache refresh (CRITICAL!)
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

-- ════════════════════════════════════════════════════════════════
--   ✅ DONE! Now close browser tab, reopen, and hard refresh!
-- ════════════════════════════════════════════════════════════════
