# Email Timing Fix - Scheduled Time Enforcement

## Problem

Previously, when the internet was disconnected during the scheduled time window and came back later, emails would be sent immediately when the CRON job ran - even if the scheduled time had passed by hours.

**Example:**
- Email scheduled for 6:40 PM
- Internet down at 6:36 PM
- Internet back at 7:19 PM
- Email sent at 7:20 PM ❌ (should not have been sent)

## Solution

Implemented a **10-minute delivery window** for scheduled emails:

1. **On-Time Delivery**: Emails are only sent if the current time is within 10 minutes of their scheduled time
2. **Missed Emails**: Emails older than 10 minutes are marked as 'missed' and will NOT be sent
3. **Automatic Cleanup**: Every CRON run checks for expired emails and marks them appropriately

## How It Works

### Before (Old Behavior)
```
CRON Job runs → Checks all pending emails → Sends if scheduled_for <= NOW()
```
Result: Any email with a past scheduled time gets sent immediately

### After (New Behavior)
```
CRON Job runs → Checks two categories:

1. SENDABLE EMAILS (within 10-minute window):
   - scheduled_for >= (NOW - 10 minutes)
   - scheduled_for <= NOW
   → These are sent

2. EXPIRED EMAILS (older than 10 minutes):
   - scheduled_for < (NOW - 10 minutes)
   → These are marked as 'missed' and NOT sent
```

## Technical Implementation

### Updated: `/supabase/functions/server/email_processor.tsx`

Key changes:
1. Added 10-minute time window calculation
2. Separate queries for sendable vs expired emails
3. Automatic marking of expired emails as 'missed'

```typescript
const now = new Date();
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

// Only get emails within the 10-minute window
.gte('scheduled_for', tenMinutesAgo.toISOString())
.lte('scheduled_for', now.toISOString())
```

### New Database Migration

File: `/supabase/migrations/add_missed_status_to_email_queue.sql`

- Adds 'missed' as a valid status
- Adds constraint checking for valid status values
- Creates index for efficient querying of missed emails

## Email Statuses

| Status | Description |
|--------|-------------|
| `pending` | Email is scheduled and waiting to be sent |
| `processing` | Email is currently being sent |
| `sent` | Email was successfully sent within the delivery window |
| `failed` | Email sending failed due to an error (will retry based on retry_count) |
| `missed` | Email was not sent because the scheduled time passed beyond the 10-minute window |

## Deployment Steps

### 1. Deploy Updated Email Processor

The updated code is in `/supabase/functions/server/email_processor.tsx`. Deploy using:

```bash
npx supabase functions deploy make-server-40d4d8fd
```

Or use the deploy scripts:
- Windows: `deploy.bat`
- Mac/Linux: `./deploy.sh`

### 2. Run Database Migration

In Supabase Dashboard → SQL Editor → New Query, run:

```sql
-- Add 'missed' status to email_queue table
COMMENT ON COLUMN email_queue.status IS 'Email status: pending, processing, sent, failed, or missed';

-- Add constraint for valid status values
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
```

Or run the migration file directly:
```bash
cat /supabase/migrations/add_missed_status_to_email_queue.sql
```

### 3. Verify CRON Job is Running

Check that the CRON job is active:

```sql
SELECT 
  jobname,
  schedule,
  active,
  jobid
FROM cron.job 
WHERE jobname = 'resilio-email-scheduler';
```

Should show:
- Schedule: `*/5 * * * *` (every 5 minutes)
- Active: `true`

## Testing

### Test Case 1: Normal Email (Within Window)
1. Schedule email for 2 minutes from now
2. Wait for CRON to run (within 5-10 minutes)
3. Email should be sent ✅

### Test Case 2: Internet Outage (Beyond Window)
1. Schedule email for 6:40 PM
2. Disconnect internet at 6:35 PM
3. Reconnect internet at 7:00 PM (20 minutes later)
4. Wait for CRON to run
5. Email should be marked as 'missed', NOT sent ✅

### Verify Missed Emails

Check the email queue:

```sql
SELECT 
  id,
  email_type,
  scheduled_for,
  status,
  error_message,
  created_at
FROM email_queue
WHERE status = 'missed'
ORDER BY scheduled_for DESC
LIMIT 10;
```

## Configuration

### Adjust Time Window

To change the 10-minute window, edit `/supabase/functions/server/email_processor.tsx`:

```typescript
// Change 10 to your desired minutes
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
```

Recommended values:
- **5 minutes**: Strict timing (only for reliable internet)
- **10 minutes**: Balanced (recommended)
- **15 minutes**: Lenient (for unreliable connections)

### CRON Frequency

Current: Every 5 minutes (`*/5 * * * *`)

To change, update the CRON job in Supabase:

```sql
-- First, unschedule existing job
SELECT cron.unschedule('resilio-email-scheduler');

-- Then create new job with different schedule
-- Example: Every 2 minutes
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/2 * * * *',
    $$ ... $$
);
```

## Monitoring

### Check Email Processing Logs

In Supabase Dashboard → Edge Functions → make-server-40d4d8fd → Logs

Look for:
- `📧 Found X pending emails to process`
- `⏰ Marking X expired emails as missed`
- `✅ Email sent: [email_id]`

### Check CRON Job History

```sql
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC
LIMIT 20;
```

### Email Queue Statistics

```sql
SELECT 
  status,
  COUNT(*) as count,
  MIN(scheduled_for) as earliest,
  MAX(scheduled_for) as latest
FROM email_queue
GROUP BY status
ORDER BY count DESC;
```

## Troubleshooting

### Emails Still Being Sent Late

1. Check if migration was applied:
   ```sql
   SELECT constraint_name 
   FROM information_schema.table_constraints 
   WHERE table_name = 'email_queue' 
   AND constraint_name = 'email_queue_status_check';
   ```

2. Verify email processor was deployed:
   - Check deployment timestamp in Supabase Dashboard
   - Check function logs for new logic (`⏰ Marking X expired emails as missed`)

### Missed Emails Not Being Marked

1. Check CRON job is running:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';
   ```

2. Check CRON job logs:
   ```sql
   SELECT * FROM cron.job_run_details 
   ORDER BY start_time DESC LIMIT 5;
   ```

3. Manually trigger email processor:
   ```bash
   curl -X POST \
     https://YOUR_PROJECT.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_API_KEY
   ```

## User Experience

### Before Fix
- ❌ Emails sent at wrong times
- ❌ Confusing "future self" messages arriving hours late
- ❌ Reminders sent after the event

### After Fix
- ✅ Emails only sent at scheduled time (±10 minutes)
- ✅ Late emails marked as 'missed' instead of being sent
- ✅ Predictable and reliable scheduling

## Future Enhancements

Possible improvements:
1. **User notification** when emails are missed
2. **Retry options** for missed emails
3. **Adjustable time windows** per email type
4. **Dashboard view** of missed emails
5. **Email history** showing all statuses

## Summary

✅ **Fixed**: Emails now respect scheduled time strictly  
✅ **Added**: 10-minute delivery window  
✅ **Added**: 'missed' status for expired emails  
✅ **Result**: Reliable, predictable email scheduling regardless of internet connectivity

The system now ensures that scheduled emails are only sent when intended, not when the internet happens to reconnect.
