-- Enable pg_cron extension (Supabase has this built-in)
-- This migration sets up a proper job queue system for scheduled emails

-- Create email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  email_type TEXT NOT NULL, -- 'future_message' or 'reminder'
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB -- Store additional data like message_id, task, etc.
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON email_queue(user_id);

-- Function to process pending emails
CREATE OR REPLACE FUNCTION process_pending_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_record RECORD;
  result JSONB;
BEGIN
  -- Get all pending emails that are due
  FOR email_record IN
    SELECT * FROM email_queue
    WHERE status = 'pending'
    AND scheduled_for <= NOW()
    ORDER BY scheduled_for ASC
    LIMIT 50 -- Process in batches
  LOOP
    BEGIN
      -- Mark as processing
      UPDATE email_queue
      SET status = 'processing'
      WHERE id = email_record.id;

      -- Call Edge Function to send email
      SELECT
        content::jsonb INTO result
      FROM
        http((
          'POST',
          current_setting('app.supabase_url') || '/functions/v1/make-server-40d4d8fd/internal/send-email',
          ARRAY[
            http_header('Authorization', 'Bearer ' || current_setting('app.supabase_service_key')),
            http_header('Content-Type', 'application/json')
          ],
          'application/json',
          jsonb_build_object(
            'emailId', email_record.id,
            'userEmail', email_record.user_email,
            'userName', email_record.user_name,
            'emailType', email_record.email_type,
            'subject', email_record.subject,
            'messageContent', email_record.message_content,
            'metadata', email_record.metadata
          )::text
        )::http_request);

      -- Mark as sent
      UPDATE email_queue
      SET 
        status = 'sent',
        sent_at = NOW()
      WHERE id = email_record.id;

      RAISE NOTICE 'Email sent successfully: %', email_record.id;

    EXCEPTION WHEN OTHERS THEN
      -- Mark as failed and log error
      UPDATE email_queue
      SET 
        status = 'failed',
        error_message = SQLERRM,
        retry_count = retry_count + 1
      WHERE id = email_record.id;

      RAISE WARNING 'Failed to send email %: %', email_record.id, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- Note: pg_cron is only available on paid Supabase plans
-- For free tier, use the HTTP endpoint approach with external cron service
-- To enable pg_cron on paid plans, run:
-- SELECT cron.schedule('process-emails', '* * * * *', 'SELECT process_pending_emails();');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON email_queue TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON email_queue TO authenticated;
