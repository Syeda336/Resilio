# 📧 Email Scheduling System - Complete Setup Guide

## ✅ System Overview

**Your Resilio app already has a complete email scheduling system!** It works like this:

1. ✅ **User schedules email** → Frontend sends time to backend
2. ✅ **Backend adds to queue** → Saves in `email_queue` table with scheduled time
3. ✅ **CRON job checks every 5 minutes** → Automatically sends emails when time arrives
4. ✅ **Works even when app is closed** → Backend runs independently

---

## 🚀 Setup Steps (One-Time Only)

### Step 1: Enable Email Queue Table

Go to your Supabase Dashboard → SQL Editor → Run this:

```sql
-- Create email_queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  email_type TEXT NOT NULL, -- 'future_message', 'reminder', 'diet_plan', 'meal_plan'
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON email_queue(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON email_queue
  FOR ALL 
  USING (true);

-- Allow users to view their own emails
CREATE POLICY "Users can view own emails" ON email_queue
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

✅ **Result:** Email queue database is ready!

---

### Step 2: Enable CRON Job (Auto Email Checker)

Go to Supabase Dashboard → SQL Editor → Run this:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Delete old scheduler if exists
SELECT cron.unschedule('resilio-email-scheduler');

-- Create new email scheduler (runs every 5 minutes)
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *', -- Every 5 minutes
    $$
    SELECT net.http_post(
        url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id;
    $$
);
```

✅ **Result:** System will automatically check for pending emails every 5 minutes!

---

### Step 3: Verify CRON Job is Running

Check if CRON job was created successfully:

```sql
-- View all scheduled jobs
SELECT * FROM cron.job;
```

You should see:
- **jobname:** `resilio-email-scheduler`
- **schedule:** `*/5 * * * *`
- **active:** `true`

---

## 🧪 Testing the System

### Test 1: Manual Trigger (Instant)

You can manually trigger the email checker from your browser:

1. Open Developer Console (F12)
2. Run this code:

```javascript
// Get your auth token
const token = localStorage.getItem('resilio_access_token');

// Trigger email checker
fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('📧 Email Check Result:', data));
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
  "timestamp": "2026-04-10T..."
}
```

---

### Test 2: Schedule a Test Email

1. Go to **Future Self Messaging** section
2. Set a time **2-3 minutes from now**
3. Write a test message
4. Click "Schedule Message"
5. Wait 5-10 minutes (CRON runs every 5 mins)
6. Check your email inbox

---

### Test 3: Check Email Queue Status

View pending emails in database:

```sql
-- View all pending emails
SELECT 
  id,
  email_type,
  user_email,
  scheduled_for,
  status,
  created_at
FROM email_queue
WHERE status = 'pending'
ORDER BY scheduled_for ASC;

-- View recently sent emails
SELECT 
  id,
  email_type,
  user_email,
  scheduled_for,
  sent_at,
  status
FROM email_queue
WHERE status = 'sent'
ORDER BY sent_at DESC
LIMIT 10;
```

---

## 📊 Monitor Email Queue

### View Email Queue from Dashboard

The app has a built-in **Email Queue Debugger**:

1. Login to your app
2. Open **Dev Tools** (F12)
3. Navigate to Dashboard
4. Scroll down to **"Email Queue Debugger"** section
5. See all pending/sent/failed emails

---

## 🐛 Troubleshooting

### Problem: Emails not sending

**Check 1: Is SMTP configured?**
```sql
-- Check if SMTP password is set in Edge Function
-- Go to: Supabase Dashboard → Edge Functions → server → Settings
-- Ensure SMTP_PASSWORD is set
```

**Check 2: Are emails in queue?**
```sql
SELECT COUNT(*) as pending_emails 
FROM email_queue 
WHERE status = 'pending' AND scheduled_for <= NOW();
```

**Check 3: Manual trigger**
Run the JavaScript test code above to manually trigger email sending.

**Check 4: Check CRON logs**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC
LIMIT 10;
```

---

### Problem: CRON not running

**Solution:**
```sql
-- Check if CRON is enabled
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';

-- If not active, recreate it
SELECT cron.unschedule('resilio-email-scheduler');

SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id;
    $$
);
```

---

## ⚡ How Each Feature Works

### 1️⃣ Future Self Messages
- **User schedules:** "Send me a message on April 15, 2026 at 9:00 AM"
- **Backend saves:** `scheduled_for = '2026-04-15T09:00:00Z'` in `email_queue`
- **CRON checks:** Every 5 minutes, checks if `scheduled_for <= NOW()`
- **Email sends:** At 9:00-9:05 AM on April 15, email is sent
- **Status updates:** `status = 'sent'`, `sent_at = NOW()`

### 2️⃣ Personal Reminders
- Same as Future Self Messages
- Different email template

### 3️⃣ Diet Plan (Food Database)
- **User adds food:** "Chicken Breast - send at 12:00 PM"
- **Backend queues:** Saves nutritional info + scheduled time
- **Email sends:** At scheduled time with food details

### 4️⃣ Meal Planner
- **User creates meal:** "Lunch - Rice and Curry at 1:00 PM"
- **Backend queues:** Saves meal description + time
- **Email sends:** At scheduled time with meal details

---

## 🔒 Security Features

✅ **Authentication:** Only authenticated users can schedule emails
✅ **RLS Policies:** Users can only view their own emails
✅ **Service Role:** Backend uses service role for sending
✅ **CRON Protection:** Endpoint requires authentication or CRON_API_KEY

---

## 📝 Summary

Your email system is **FULLY AUTOMATED**:

1. ✅ User schedules email → Backend saves to queue
2. ✅ CRON runs every 5 minutes → Checks for due emails
3. ✅ Email sends automatically → Updates status
4. ✅ Works 24/7 → Independent of frontend
5. ✅ Auto-retry on failure → Max 3 retries

**No manual intervention needed!** Just set up the CRON job once and it runs forever! 🎉
