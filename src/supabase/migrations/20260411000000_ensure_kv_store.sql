-- Ensure kv_store_40d4d8fd table exists with correct schema (FINAL FIX)
-- This runs before dropping diary_entries to ensure the correct table exists

CREATE TABLE IF NOT EXISTS kv_store_40d4d8fd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kv_store_user_id ON kv_store_40d4d8fd(user_id);
CREATE INDEX IF NOT EXISTS idx_kv_store_created_at ON kv_store_40d4d8fd(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kv_store_diary_entries ON kv_store_40d4d8fd(key) WHERE key LIKE 'diary_entry_%';

-- Enable Row Level Security
ALTER TABLE kv_store_40d4d8fd ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since we handle auth in Edge Functions)
DROP POLICY IF EXISTS "Allow all operations" ON kv_store_40d4d8fd;
CREATE POLICY "Allow all operations" ON kv_store_40d4d8fd FOR ALL USING (true) WITH CHECK (true);

-- Force refresh schema cache
NOTIFY pgrst, 'reload schema';
