-- ================================================
-- Resilio: Email Scheduler - FIXED VERSION
-- ================================================
-- This version handles Supabase permission issues
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================

-- Step 1: Enable extensions (ignore errors if already enabled)
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net;
  EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Step 2: Check if extensions are enabled
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
-- You should see both extensions listed ✅

-- ================================================
-- Step 3: Delete existing job (if any)
-- ================================================
DO $$ 
BEGIN
  PERFORM cron.unschedule('resilio-email-scheduler');
  EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ================================================
-- Step 4: Create the CRON job
-- ⚠️ IMPORTANT: Replace these values:
-- 1. YOUR_PROJECT_ID → Your actual Supabase project ID
-- 2. YOUR_CRON_API_KEY → resilio-cron-2026-secure-key (or your key)
-- ================================================

SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT
        net.http_post(
            url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := '{}'::jsonb
        ) as request_id;
    $$
);

-- ================================================
-- Step 5: Verify the cron job was created
-- ================================================
SELECT 
  jobid,
  jobname,
  schedule,
  active
FROM cron.job
WHERE jobname = 'resilio-email-scheduler';

-- Expected Result:
-- jobid: 4 (or any number)
-- jobname: resilio-email-scheduler
-- schedule: */5 * * * *
-- active: true ✅

-- ================================================
-- Step 6: Wait 5-10 minutes, then check if CRON is running
-- ================================================
-- Run this query after 10 minutes:
-- SELECT 
--   start_time,
--   end_time,
--   status,
--   return_message
-- FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
-- ORDER BY start_time DESC
-- LIMIT 10;

-- ================================================
-- NOTES:
-- ================================================
-- 1. If you get permission errors, it's okay - extensions might already be enabled
-- 2. The CRON job creation (Step 4) is the most important part
-- 3. Make sure to replace YOUR_PROJECT_ID and YOUR_CRON_API_KEY
-- 4. The job will start running within 5 minutes automatically

-- ================================================
-- EXAMPLE with real values (REPLACE WITH YOURS):
-- ================================================
-- SELECT cron.schedule(
--     'resilio-email-scheduler',
--     '*/5 * * * *',
--     $$
--     SELECT
--         net.http_post(
--             url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=resilio-cron-2026-secure-key',
--             headers := '{"Content-Type": "application/json"}'::jsonb,
--             body := '{}'::jsonb
--         ) as request_id;
--     $$
-- );
