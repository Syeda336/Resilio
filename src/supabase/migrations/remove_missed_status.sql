-- Remove the 'missed' status constraint (no longer needed)
-- Emails will now always be sent when internet is available, regardless of delay

-- Drop the constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'email_queue_status_check'
  ) THEN
    ALTER TABLE email_queue DROP CONSTRAINT email_queue_status_check;
  END IF;
END $$;

-- Update comment to reflect new behavior
COMMENT ON COLUMN email_queue.status IS 'Email status: pending, processing, sent, or failed (no missed status - emails always sent when internet available)';

-- Drop the missed status index (no longer needed)
DROP INDEX IF EXISTS idx_email_queue_missed;
