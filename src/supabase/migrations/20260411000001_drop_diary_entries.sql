-- Drop diary_entries table if it exists (FINAL FIX for schema cache error)
-- This migration removes the old table that's causing the error

DROP TABLE IF EXISTS public.diary_entries CASCADE;

-- Force PostgREST schema cache reload (multiple times for reliability)
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
