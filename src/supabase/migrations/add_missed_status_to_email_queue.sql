-- Add 'missed' status to email_queue table
-- This status is used when emails are not sent within the delivery window

-- Update the comment on the status column to include 'missed'
COMMENT ON COLUMN email_queue.status IS 'Email status: pending, processing, sent, failed, or missed';

-- Add a check constraint to ensure valid status values (optional, for data integrity)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'email_queue_status_check'
  ) THEN
    ALTER TABLE email_queue
    ADD CONSTRAINT email_queue_status_check 
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'missed'));
  END IF;
END $$;

-- Create index for missed emails
CREATE INDEX IF NOT EXISTS idx_email_queue_missed ON email_queue(scheduled_for) WHERE status = 'missed';

-- Grant necessary permissions (if needed)
GRANT SELECT, INSERT, UPDATE ON email_queue TO authenticated;
