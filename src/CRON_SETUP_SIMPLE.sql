-- ================================================
-- SIMPLEST VERSION - Just Create CRON Job
-- ================================================
-- If extensions are already enabled, just run this:
-- ================================================

-- Remove old job if exists
DO $$ 
BEGIN
  PERFORM cron.unschedule('resilio-email-scheduler');
  EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ================================================
-- Create new CRON job
-- ⚠️ REPLACE: YOUR_PROJECT_ID and YOUR_CRON_API_KEY
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

-- Verify
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';
