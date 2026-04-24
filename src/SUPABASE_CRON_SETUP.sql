-- ================================================
-- Resilio: Email Scheduler using Supabase pg_cron
-- ================================================
-- This SQL script sets up automatic email scheduling
-- WITHOUT needing external cron services!
-- 
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================

-- Step 1: Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Enable pg_net extension (for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 3: Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Step 4: Create the cron job to run every 5 minutes
-- Replace YOUR_PROJECT_ID with your actual Supabase project ID
-- Replace YOUR_CRON_API_KEY with your actual CRON_API_KEY from Edge Function secrets

SELECT cron.schedule(
    'resilio-email-scheduler',  -- Job name
    '*/5 * * * *',              -- Run every 5 minutes (cron expression)
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
-- IMPORTANT: Update the URL above with:
-- 1. YOUR_PROJECT_ID (e.g., jcbtczjhqdyuoyctjcbl)
-- 2. YOUR_CRON_API_KEY from Edge Function secrets
-- ================================================

-- Step 5: Verify the cron job was created
SELECT * FROM cron.job;

-- Step 6: Check cron job run history (after a few minutes)
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC 
LIMIT 10;

-- ================================================
-- Useful Commands:
-- ================================================

-- To view all cron jobs:
-- SELECT * FROM cron.job;

-- To view recent cron runs:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- To delete the cron job (if needed):
-- SELECT cron.unschedule('resilio-email-scheduler');

-- To update the schedule (if needed):
-- First unschedule, then schedule again with new timing

-- ================================================
-- Troubleshooting:
-- ================================================

-- Check if extensions are enabled:
-- SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');

-- Check cron job status:
-- SELECT 
--   jobname,
--   schedule,
--   active,
--   jobid
-- FROM cron.job 
-- WHERE jobname = 'resilio-email-scheduler';

-- Check recent run results:
-- SELECT 
--   start_time,
--   end_time,
--   status,
--   return_message
-- FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
-- ORDER BY start_time DESC
-- LIMIT 5;

-- ================================================
-- Alternative Schedules:
-- ================================================

-- Every 1 minute (more aggressive):
-- '* * * * *'

-- Every 10 minutes:
-- '*/10 * * * *'

-- Every 15 minutes:
-- '*/15 * * * *'

-- Every hour:
-- '0 * * * *'

-- Every day at 9 AM:
-- '0 9 * * *'

-- ================================================
