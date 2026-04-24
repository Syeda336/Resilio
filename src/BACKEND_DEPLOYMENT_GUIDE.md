# 🚀 Complete Backend Deployment Guide - Supabase Email Scheduler

## 📋 Overview

Yeh guide aapko **complete backend implementation** deploy karne mein madad karega jo emails ko scheduled time pe automatically send karega.

---

## ✅ What This Will Do

**After deployment:**
- ✅ Emails automatically send at scheduled time
- ✅ Works 24/7 without app being open
- ✅ Handles Future Self Messages
- ✅ Handles Personal Reminders
- ✅ Handles Food Database emails
- ✅ Handles Meal Planner emails

---

## 🔧 Prerequisites (Already Done ✅)

These files are already in your project:

1. **`/supabase/functions/server/email_processor.tsx`** ✅
   - Processes pending emails
   - Sends via SMTP
   - Updates status in database

2. **`/supabase/functions/server/email_nodemailer.tsx`** ✅
   - Email templates
   - SMTP sending logic
   - Different email types

3. **Database table: `email_queue`** ✅
   - Stores scheduled emails
   - Tracks status (pending → sent)

**What You Need to Do:**
- Deploy Edge Functions to Supabase
- Setup CRON job in database
- Configure SMTP credentials

---

## 📦 Step 1: Deploy Edge Functions (5 minutes)

### Option A: Using Deploy Script (Recommended)

**Windows:**
```bash
# Make sure you're in project root
cd /path/to/your/project

# Run deploy script
deploy.bat
```

**Mac/Linux:**
```bash
# Make sure you're in project root
cd /path/to/your/project

# Make script executable
chmod +x deploy.sh

# Run deploy script
./deploy.sh
```

### Option B: Manual Deployment

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_ID

# Deploy functions
npx supabase functions deploy make-server-40d4d8fd
```

**Verify Deployment:**
1. Go to Supabase Dashboard
2. Navigate to: **Edge Functions**
3. You should see: `make-server-40d4d8fd`
4. Status should be: **Deployed** ✅

---

## 🔐 Step 2: Configure SMTP Credentials (3 minutes)

### Get Your SMTP Details:

**For Gmail:**
- SMTP Host: `smtp.gmail.com`
- SMTP Port: `587`
- SMTP User: Your Gmail address
- SMTP Password: **App Password** (not regular password)
  - Go to: https://myaccount.google.com/apppasswords
  - Generate new app password
  - Use that password

**For Outlook/Hotmail:**
- SMTP Host: `smtp-mail.outlook.com`
- SMTP Port: `587`
- SMTP User: Your Outlook email
- SMTP Password: Your Outlook password

### Add Secrets to Supabase:

1. Go to **Supabase Dashboard**
2. Navigate to: **Edge Functions → Settings**
3. Scroll to: **Secrets**
4. Add these secrets:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASSWORD = your-app-password
SMTP_FROM = your-email@gmail.com
```

**Also add CRON API key:**
```
CRON_API_KEY = resilio-cron-2026-secure-key
```

(This is used to protect the CRON endpoint)

**Screenshot Guide:**
```
Supabase Dashboard
  → Edge Functions
    → Settings
      → Secrets
        → [+ Add secret]
          Name: SMTP_HOST
          Value: smtp.gmail.com
          [Save]
```

---

## 🗄️ Step 3: Setup Database CRON Job (2 minutes)

### Get Your Project Details:

1. **Project ID:**
   - Go to Supabase Dashboard
   - Look at URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`
   - Copy `YOUR_PROJECT_ID`

2. **CRON API Key:**
   - Use the one you created in Step 2
   - Or use: `resilio-cron-2026-secure-key`

### Run SQL Setup:

1. Go to **Supabase Dashboard**
2. Navigate to: **SQL Editor**
3. Click: **New Query**
4. Paste this SQL:

```sql
-- ================================================
-- Email Scheduler CRON Job Setup
-- ================================================

-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Step 3: Create CRON job
-- ⚠️ REPLACE THESE VALUES:
-- 1. YOUR_PROJECT_ID → Your actual project ID
-- 2. YOUR_CRON_API_KEY → The API key you set in secrets

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

-- Step 4: Verify creation
SELECT * FROM cron.job;
```

**Example with real values:**
```sql
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT
        net.http_post(
            url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=resilio-cron-2026-secure-key',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := '{}'::jsonb
        ) as request_id;
    $$
);
```

5. Click: **Run**
6. Check result: Should show success ✅

### Verify CRON Job:

```sql
-- Check if job exists
SELECT 
  jobid,
  jobname,
  schedule,
  active
FROM cron.job
WHERE jobname = 'resilio-email-scheduler';
```

**Expected Result:**
```
jobid: 4 (or any number)
jobname: resilio-email-scheduler
schedule: */5 * * * *
active: true ✅
```

---

## 🧪 Step 4: Test the System (5 minutes)

### Quick Test:

1. **Schedule a test email:**
   - Open your web app
   - Go to Future Self section
   - Schedule email for **5 minutes from now**
   - Message: "Test email from Resilio!"

2. **Check database:**
   ```sql
   SELECT * FROM email_queue 
   WHERE created_at > NOW() - INTERVAL '10 minutes'
   ORDER BY created_at DESC;
   ```
   
   **Expected:**
   ```
   status: pending ✅
   scheduled_for: [your time]
   ```

3. **Wait 5-10 minutes**
   - Close browser (optional test)
   - Do something else

4. **Check email inbox:**
   - Email should arrive ✅
   - Subject: "📬 Message from Your Past Self"

5. **Check database again:**
   ```sql
   SELECT * FROM email_queue 
   WHERE created_at > NOW() - INTERVAL '15 minutes'
   ORDER BY created_at DESC;
   ```
   
   **Expected:**
   ```
   status: sent ✅
   sent_at: [actual send time]
   ```

### Monitor CRON Job:

```sql
-- Check recent CRON runs
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC
LIMIT 10;
```

**Expected:**
```
Runs every 5 minutes ✅
Status: succeeded ✅
```

---

## 📊 Step 5: Monitoring & Maintenance

### Daily Health Check:

```sql
-- Quick health check
SELECT 
  'Pending Emails' as metric,
  COUNT(*) as count
FROM email_queue
WHERE status = 'pending'
UNION ALL
SELECT 
  'Sent Today',
  COUNT(*)
FROM email_queue
WHERE status = 'sent'
  AND sent_at::date = CURRENT_DATE
UNION ALL
SELECT 
  'Failed Today',
  COUNT(*)
FROM email_queue
WHERE status = 'failed'
  AND updated_at::date = CURRENT_DATE;
```

### Check Email Performance:

```sql
-- Average delivery time
SELECT 
  email_type,
  COUNT(*) as total,
  AVG(EXTRACT(EPOCH FROM (sent_at - scheduled_for))/60) as avg_delay_minutes
FROM email_queue
WHERE status = 'sent'
  AND sent_at > NOW() - INTERVAL '7 days'
GROUP BY email_type;
```

**Expected:**
- avg_delay_minutes: 2-5 minutes (due to CRON frequency)

---

## 🚨 Troubleshooting

### Problem 1: CRON job not created

**Error:** `extension "pg_cron" does not exist`

**Fix:**
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Try creating job again
```

---

### Problem 2: Emails not sending

**Check 1: SMTP configured?**
```
Supabase Dashboard → Edge Functions → Settings → Secrets
Verify all SMTP_* secrets are set ✅
```

**Check 2: Edge Function deployed?**
```
Supabase Dashboard → Edge Functions
Look for: make-server-40d4d8fd
Status: Deployed ✅
```

**Check 3: CRON running?**
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC LIMIT 5;
```

**Check 4: Test Edge Function manually:**
```bash
curl -X POST \
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY' \
  -H 'Content-Type: application/json'
```

---

### Problem 3: Emails delayed

**Normal Delay:**
- Maximum 5 minutes (CRON frequency)
- This is expected ✅

**Reduce Delay:**
```sql
-- Unschedule existing job
SELECT cron.unschedule('resilio-email-scheduler');

-- Create new job (every 1 minute)
SELECT cron.schedule(
    'resilio-email-scheduler',
    '* * * * *',  -- Every 1 minute
    $$
    SELECT net.http_post(...);
    $$
);
```

**Warning:** More frequent = more database load

---

### Problem 4: CRON job stopped

**Check status:**
```sql
SELECT active FROM cron.job WHERE jobname = 'resilio-email-scheduler';
```

**If active = false:**
```sql
-- Delete and recreate
SELECT cron.unschedule('resilio-email-scheduler');

-- Then run Step 3 setup again
```

---

## 📈 Optimization Tips

### 1. Adjust CRON Frequency

**Current:** Every 5 minutes (`*/5 * * * *`)

**Options:**
- Every 1 minute: `* * * * *` (more responsive)
- Every 10 minutes: `*/10 * * * *` (less load)
- Every 15 minutes: `*/15 * * * *` (minimal load)

### 2. Monitor Email Queue Size

```sql
-- Check queue growth
SELECT 
  DATE(created_at) as date,
  COUNT(*) as emails_created,
  COUNT(*) FILTER (WHERE status = 'sent') as emails_sent,
  COUNT(*) FILTER (WHERE status = 'pending') as still_pending
FROM email_queue
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 3. Clean Old Emails

```sql
-- Delete emails older than 90 days
DELETE FROM email_queue
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status = 'sent';
```

**Or archive them:**
```sql
-- Create archive table
CREATE TABLE email_queue_archive (LIKE email_queue);

-- Move old emails
INSERT INTO email_queue_archive
SELECT * FROM email_queue
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status = 'sent';

-- Delete from main table
DELETE FROM email_queue
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status = 'sent';
```

---

## ✅ Verification Checklist

After deployment, verify these:

- [ ] Edge Function deployed ✅
- [ ] SMTP secrets configured ✅
- [ ] CRON job created ✅
- [ ] CRON job active ✅
- [ ] Test email sent successfully ✅
- [ ] Email received in inbox ✅
- [ ] Database status updated to 'sent' ✅
- [ ] CRON runs every 5 minutes ✅

---

## 📝 Quick Reference Commands

### Check CRON Status:
```sql
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';
```

### Check Recent Runs:
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Check Pending Emails:
```sql
SELECT * FROM email_queue WHERE status = 'pending' ORDER BY scheduled_for;
```

### Check Recent Sent:
```sql
SELECT * FROM email_queue WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 10;
```

### Manual Test:
```sql
-- Trigger email processor manually
SELECT net.http_post(
    url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_API_KEY',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
);
```

---

## 🎯 Success Criteria

**System is working if:**

1. **CRON job active:**
   ```sql
   SELECT active FROM cron.job WHERE jobname = 'resilio-email-scheduler';
   -- Result: true ✅
   ```

2. **Regular runs:**
   ```sql
   SELECT COUNT(*) FROM cron.job_run_details 
   WHERE start_time > NOW() - INTERVAL '1 hour';
   -- Result: ~12 (every 5 min) ✅
   ```

3. **Emails sending:**
   ```sql
   SELECT COUNT(*) FROM email_queue 
   WHERE status = 'sent' 
   AND sent_at > NOW() - INTERVAL '24 hours';
   -- Result: > 0 ✅
   ```

4. **No stuck emails:**
   ```sql
   SELECT COUNT(*) FROM email_queue 
   WHERE status = 'pending' 
   AND scheduled_for < NOW() - INTERVAL '10 minutes';
   -- Result: 0 ✅
   ```

---

## 📚 Related Documentation

- `/EMAIL_WORKS_WITHOUT_APP.md` - How system works 24/7
- `/VERIFY_CRON_WORKING.md` - Detailed verification
- `/FINAL_EMAIL_FIX_SUMMARY.md` - Complete system overview
- `/SUPABASE_CRON_SETUP.sql` - Raw SQL setup

---

## 🎉 Congratulations!

After completing these steps:

✅ Backend implementation complete  
✅ Emails will send automatically  
✅ Works 24/7 without app  
✅ Fully automated system  

**Just schedule emails and forget! System handles everything!** 🚀

---

**Deployment Time:** ~15 minutes  
**Difficulty:** Easy  
**Result:** Production-ready email scheduler
