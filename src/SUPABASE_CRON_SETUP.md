# 🔧 Supabase CRON Setup - Step by Step

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Supabase project created
- ✅ Edge Function deployed (`make-server-40d4d8fd`)
- ✅ SMTP configured in Edge Function secrets

---

## 🚀 Step-by-Step Setup

### Step 1: Enable CRON Extension

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `Resilio`

2. **Navigate to SQL Editor**
   - Left sidebar → Click **"SQL Editor"**
   - Click **"+ New Query"**

3. **Run This SQL**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
```

4. **Click "Run"** (Ctrl + Enter)

✅ **Expected Result:**
```
Success. No rows returned
```

---

### Step 2: Create Email Scheduler Job

**Copy and paste this EXACT SQL:**

```sql
-- Delete old scheduler if exists (cleanup)
SELECT cron.unschedule('resilio-email-scheduler');

-- Create new email scheduler (runs every 5 minutes)
SELECT cron.schedule(
    'resilio-email-scheduler',           -- Job name
    '*/5 * * * *',                       -- Every 5 minutes
    $$
    SELECT net.http_post(
        url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id;
    $$
);
```

⚠️ **IMPORTANT:** Replace `jcbtczjhqdyuoyctjcbl` with YOUR Supabase project ID!

**How to find your Project ID:**
1. Look at your Supabase Dashboard URL
2. Format: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`
3. Copy the ID part

✅ **Expected Result:**
```
1 row(s) returned
```

---

### Step 3: Verify CRON Job Created

**Run this query to check:**

```sql
-- View all scheduled jobs
SELECT 
    jobid,
    jobname,
    schedule,
    active,
    command
FROM cron.job;
```

✅ **Expected Output:**
```
jobid | jobname                    | schedule      | active | command
------|----------------------------|---------------|--------|------------------
1     | resilio-email-scheduler    | */5 * * * *   | true   | SELECT net.http_post...
```

**Key checks:**
- ✅ `jobname` = `resilio-email-scheduler`
- ✅ `schedule` = `*/5 * * * *` (every 5 minutes)
- ✅ `active` = `true`

---

### Step 4: Monitor CRON Job Execution

**Check recent job runs:**

```sql
-- View recent CRON job executions
SELECT 
    runid,
    jobid,
    start_time,
    end_time,
    status,
    return_message
FROM cron.job_run_details
WHERE jobid = (
    SELECT jobid FROM cron.job 
    WHERE jobname = 'resilio-email-scheduler'
)
ORDER BY start_time DESC
LIMIT 10;
```

✅ **Healthy Output:**
```
runid | start_time           | end_time            | status     | return_message
------|---------------------|---------------------|------------|------------------
102   | 2026-04-10 15:30:00 | 2026-04-10 15:30:02 | succeeded  | null
101   | 2026-04-10 15:25:00 | 2026-04-10 15:25:01 | succeeded  | null
100   | 2026-04-10 15:20:00 | 2026-04-10 15:20:02 | succeeded  | null
```

**What to look for:**
- ✅ `status` = `succeeded` (job ran successfully)
- ✅ Regular execution every 5 minutes
- ✅ `end_time` - `start_time` = 1-3 seconds (fast execution)

❌ **Warning Signs:**
- `status` = `failed` → Check error in `return_message`
- No recent runs → Job might not be active
- Long execution time (>10 seconds) → Backend issue

---

## 🧪 Testing the Setup

### Test 1: Manual CRON Trigger

**Option A: Via SQL (Immediate)**
```sql
-- Manually trigger the CRON job RIGHT NOW
SELECT cron.schedule(
    'test-manual-trigger',
    '* * * * *',  -- Run once immediately
    $$
    SELECT net.http_post(
        url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id;
    $$
);

-- Wait 1 minute, then cleanup
SELECT cron.unschedule('test-manual-trigger');
```

**Option B: Via Browser Console**
```javascript
// Open browser console (F12) and run:
const token = localStorage.getItem('resilio_access_token');

fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ CRON Trigger Result:', data);
  if (data.success) {
    console.log('📧 Emails sent:', data.results.queueSent);
    console.log('⏳ Emails pending:', data.results.queueProcessed - data.results.queueSent);
  }
});
```

✅ **Expected Response:**
```json
{
  "success": true,
  "results": {
    "queueProcessed": 0,
    "queueSent": 0,
    "queueFailed": 0,
    "retriedEmails": 0,
    "message": "No pending emails"
  },
  "timestamp": "2026-04-10T15:30:00.000Z"
}
```

---

### Test 2: Schedule Test Email

1. **Create Future Self Message**
   - Go to your app → Future Self Messaging
   - Set time: **5 minutes from now**
   - Message: "Test - CRON working!"
   - Click **"Schedule Message"**

2. **Verify Email in Queue**
```sql
SELECT 
    email_type,
    scheduled_for,
    status,
    user_email,
    message_content
FROM email_queue
WHERE status = 'pending'
ORDER BY scheduled_for ASC;
```

✅ **Expected:**
```
email_type      | scheduled_for        | status  | message_content
----------------|---------------------|---------|------------------
future_message  | 2026-04-10 15:35:00 | pending | Test - CRON working!
```

3. **Wait for CRON to run** (max 5 minutes)

4. **Check if email was sent**
```sql
SELECT 
    email_type,
    scheduled_for,
    sent_at,
    status
FROM email_queue
WHERE email_type = 'future_message'
ORDER BY created_at DESC
LIMIT 5;
```

✅ **Expected:**
```
email_type      | scheduled_for        | sent_at              | status
----------------|---------------------|---------------------|--------
future_message  | 2026-04-10 15:35:00 | 2026-04-10 15:35:02 | sent
```

5. **Check your email inbox** ✅

---

## 🔧 Advanced Configuration

### Change CRON Frequency

**Every 1 minute (faster, but more server load):**
```sql
SELECT cron.unschedule('resilio-email-scheduler');

SELECT cron.schedule(
    'resilio-email-scheduler',
    '* * * * *',  -- Every minute
    $$ SELECT net.http_post(...) $$
);
```

**Every 10 minutes (slower, less server load):**
```sql
SELECT cron.unschedule('resilio-email-scheduler');

SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/10 * * * *',  -- Every 10 minutes
    $$ SELECT net.http_post(...) $$
);
```

**Every 15 minutes:**
```sql
*/15 * * * *
```

**Every hour:**
```sql
0 * * * *
```

---

### CRON Schedule Format

```
 *    *    *    *    *
 │    │    │    │    │
 │    │    │    │    └─── Day of week (0-7, both 0 and 7 = Sunday)
 │    │    │    └──────── Month (1-12)
 │    │    └───────────── Day of month (1-31)
 │    └────────────────── Hour (0-23)
 └─────────────────────── Minute (0-59)
```

**Examples:**
- `*/5 * * * *` = Every 5 minutes
- `0 * * * *` = Every hour (at :00)
- `0 9 * * *` = Daily at 9:00 AM
- `0 9 * * 1` = Every Monday at 9:00 AM
- `*/15 8-17 * * 1-5` = Every 15 mins, 8AM-5PM, Monday-Friday

---

## 🐛 Troubleshooting

### Problem 1: CRON Job Not Running

**Symptom:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC LIMIT 1;

-- Returns: No rows
```

**Solutions:**

**A) Check if job exists:**
```sql
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';
```
If no rows → Recreate the job (Step 2)

**B) Check if job is active:**
```sql
UPDATE cron.job 
SET active = true 
WHERE jobname = 'resilio-email-scheduler';
```

**C) Restart CRON:**
```sql
SELECT cron.unschedule('resilio-email-scheduler');
-- Wait 10 seconds
-- Then recreate job (Step 2)
```

---

### Problem 2: CRON Runs But Fails

**Symptom:**
```sql
SELECT status, return_message FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC LIMIT 1;

-- Returns: status = 'failed', return_message = '...'
```

**Common Errors & Solutions:**

**Error: "connection refused"**
```
Solution: Check if Edge Function is deployed and online
```

**Error: "401 Unauthorized"**
```
Solution: CRON endpoint needs authentication - already configured to allow without API key
```

**Error: "timeout"**
```
Solution: Backend is slow - optimize email queue processing
```

---

### Problem 3: Emails Not Sending (CRON Runs Successfully)

**Check 1: Are emails in queue?**
```sql
SELECT COUNT(*) FROM email_queue WHERE status = 'pending';
```

**Check 2: Are pending emails due?**
```sql
SELECT 
    scheduled_for,
    NOW() as current_time,
    CASE 
        WHEN scheduled_for <= NOW() THEN 'DUE NOW'
        ELSE 'FUTURE'
    END as timing
FROM email_queue
WHERE status = 'pending';
```

**Check 3: SMTP configured?**
- Dashboard → Edge Functions → `server` → Settings
- Ensure `SMTP_PASSWORD` exists

**Check 4: Check failed emails:**
```sql
SELECT * FROM email_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📊 Monitoring Dashboard

**Create a monitoring view:**

```sql
-- Create a view for easy monitoring
CREATE OR REPLACE VIEW email_queue_status AS
SELECT 
    status,
    COUNT(*) as count,
    MIN(scheduled_for) as oldest_scheduled,
    MAX(scheduled_for) as newest_scheduled
FROM email_queue
GROUP BY status;

-- View the dashboard
SELECT * FROM email_queue_status;
```

✅ **Healthy Output:**
```
status     | count | oldest_scheduled     | newest_scheduled
-----------|-------|---------------------|--------------------
sent       | 45    | 2026-04-01 09:00:00 | 2026-04-10 15:30:00
pending    | 3     | 2026-04-10 16:00:00 | 2026-04-12 10:00:00
```

---

## 🎉 Success Checklist

After setup, verify:

- ✅ CRON job exists: `SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';`
- ✅ CRON job active: `active = true`
- ✅ CRON runs every 5 mins: Check `cron.job_run_details`
- ✅ Email queue exists: `SELECT * FROM email_queue LIMIT 1;`
- ✅ SMTP configured: Edge Function secrets
- ✅ Test email sent: Schedule one and verify

**All done! Your email system is now fully automated!** 🎉
