# ✅ Deploy Now - Simple Checklist

## 🚀 15-Minute Deployment

Follow these steps in order:

---

## Step 1: Deploy Edge Functions (5 min)

### Windows:
```bash
deploy.bat
```

### Mac/Linux:
```bash
chmod +x deploy.sh
./deploy.sh
```

**Verify:**
- Supabase Dashboard → Edge Functions
- Should see: `make-server-40d4d8fd` ✅

---

## Step 2: Configure SMTP (3 min)

**Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Create new app password
3. Copy the password

**Add to Supabase:**
1. Dashboard → Edge Functions → Settings → Secrets
2. Add these:

```
Name: SMTP_HOST          Value: smtp.gmail.com
Name: SMTP_PORT          Value: 587
Name: SMTP_USER          Value: your-email@gmail.com
Name: SMTP_PASSWORD      Value: your-app-password-here
Name: SMTP_FROM          Value: your-email@gmail.com
Name: CRON_API_KEY       Value: resilio-cron-2026-secure-key
```

---

## Step 3: Setup CRON Job (2 min)

**Get Your Project ID:**
- Look at Supabase URL
- Copy the ID from: `https://supabase.com/dashboard/project/YOUR_ID_HERE`

**Run SQL:**
1. Dashboard → SQL Editor → New Query
2. Paste this (replace YOUR_PROJECT_ID):

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create CRON job (REPLACE YOUR_PROJECT_ID!)
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT
        net.http_post(
            url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=resilio-cron-2026-secure-key',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := '{}'::jsonb
        ) as request_id;
    $$
);

-- Verify
SELECT * FROM cron.job;
```

**Should see:**
- jobname: `resilio-email-scheduler` ✅
- active: `true` ✅

---

## Step 4: Test (5 min)

**Schedule Test Email:**
1. Open your app
2. Go to Future Self section
3. Schedule email for 5 minutes from now
4. Message: "Test from Resilio"

**Verify in Database:**
```sql
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 1;
```

Should show:
- status: `pending` ✅

**Wait 10 minutes**

**Check Email Inbox:**
- Email should arrive ✅

**Check Database:**
```sql
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 1;
```

Should show:
- status: `sent` ✅

---

## ✅ Final Verification

Run this query:

```sql
SELECT 
  (SELECT COUNT(*) FROM cron.job WHERE jobname = 'resilio-email-scheduler' AND active = true) as cron_active,
  (SELECT COUNT(*) FROM cron.job_run_details WHERE start_time > NOW() - INTERVAL '30 minutes') as recent_runs,
  (SELECT COUNT(*) FROM email_queue WHERE status = 'pending') as pending_emails;
```

**Expected:**
- cron_active: 1 ✅
- recent_runs: >= 5 ✅
- pending_emails: 0 (if no emails scheduled) ✅

---

## 🚨 Quick Troubleshooting

### CRON not running?
```sql
-- Check job exists
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';

-- Check extension enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

### Emails not sending?
```sql
-- Check pending emails
SELECT * FROM email_queue WHERE status = 'pending';

-- Check CRON runs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

### SMTP error?
- Verify secrets in: Dashboard → Edge Functions → Settings → Secrets
- Make sure all SMTP_* secrets are set

---

## 🎉 Done!

If all steps show ✅, your backend is ready!

**What happens now:**
- Emails automatically send at scheduled time
- Works 24/7 without app open
- CRON checks every 5 minutes
- Completely automated

**You can:**
- Close your app ✅
- Shut down computer ✅
- Emails will still send ✅

---

**Need detailed help?** See `/BACKEND_DEPLOYMENT_GUIDE.md`

**Total Time:** 15 minutes  
**Result:** Production-ready email system 🚀
