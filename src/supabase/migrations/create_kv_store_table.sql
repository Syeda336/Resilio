-- Create kv_store_40d4d8fd table for storing diary entries and other KV data
-- This replaces the old diary_entries table

CREATE TABLE IF NOT EXISTS kv_store_40d4d8fd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_kv_store_created_at ON kv_store_40d4d8fd(created_at DESC);

-- Create index on key pattern for faster queries (for diary entries)
CREATE INDEX IF NOT EXISTS idx_kv_store_diary_entries ON kv_store_40d4d8fd(key) WHERE key LIKE 'diary_entry_%';

-- Enable Row Level Security
ALTER TABLE kv_store_40d4d8fd ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow all authenticated users to read/write their own data
-- Note: We'll validate user ownership in the application layer via the key pattern
CREATE POLICY "Users can access kv_store data"
  ON kv_store_40d4d8fd
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kv_store_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_kv_store_updated_at_trigger
  BEFORE UPDATE ON kv_store_40d4d8fd
  FOR EACH ROW
  EXECUTE FUNCTION update_kv_store_updated_at();
