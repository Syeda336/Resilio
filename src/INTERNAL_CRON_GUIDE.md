# 🔄 Internal Email Scheduler Setup (No External Cron!)

## ✅ **Pure Supabase Solution**

Yeh setup **completely Supabase ke andar** run hoga - koi external service nahi chahiye!

---

## 🚀 **Quick Setup (5 Minutes):**

### **Step 1: Get Your CRON_API_KEY**

1. **Go to:** Supabase Dashboard → **Edge Functions** → **make-server-40d4d8fd** → **Settings**
2. **Scroll to:** Secrets section
3. **Find:** `CRON_API_KEY`
4. **Copy the value**

**If doesn't exist:**
- Click **"Add new secret"**
- Name: `CRON_API_KEY`
- Value: `resilio-internal-cron-2026-secure`
- Save and **copy the value**

---

### **Step 2: Run SQL Setup**

1. **Go to:** Supabase Dashboard → **SQL Editor**
2. **Click:** "New Query"
3. **Open file:** `/SUPABASE_CRON_SETUP.sql`
4. **Copy the SQL code**
5. **Update these values in the SQL:**

```sql
-- Find this line (around line 28):
url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY',

-- Replace with:
url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_ACTUAL_KEY',
```

6. **Click:** "Run" button
7. **Done!** ✅

---

## 📋 **Complete SQL Code (Copy This):**

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create cron job (UPDATE THE URL!)
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT
        net.http_post(
            url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY_HERE',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := '{}'::jsonb
        ) as request_id;
    $$
);

-- Verify it was created
SELECT * FROM cron.job;
```

**⚠️ IMPORTANT:** Replace `YOUR_CRON_API_KEY_HERE` with your actual key!

---

## 🎯 **What This Does:**

1. **Enables pg_cron** - PostgreSQL's built-in cron system
2. **Enables pg_net** - PostgreSQL's HTTP client
3. **Creates scheduled job** - Runs every 5 minutes automatically
4. **Calls your Edge Function** - Processes pending emails
5. **Runs 24/7** - No external service needed!

---

## 🧪 **Verify It's Working:**

### **Check 1: Cron Job Created**

```sql
-- Run in SQL Editor:
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
jobid | jobname                    | schedule      | active
------|----------------------------|---------------|-------
1     | resilio-email-scheduler    | */5 * * * *   | true
```

---

### **Check 2: View Recent Runs (After 5-10 minutes)**

```sql
-- Run in SQL Editor:
SELECT 
    start_time,
    end_time,
    status,
    return_message,
    (end_time - start_time) as duration
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC
LIMIT 10;
```

**Expected Result:**
```
start_time              | end_time                | status    | return_message | duration
------------------------|-------------------------|-----------|----------------|----------
2026-03-15 14:30:00     | 2026-03-15 14:30:01     | succeeded | OK             | 00:00:01
2026-03-15 14:25:00     | 2026-03-15 14:25:01     | succeeded | OK             | 00:00:01
2026-03-15 14:20:00     | 2026-03-15 14:20:01     | succeeded | OK             | 00:00:01
```

---

### **Check 3: Edge Function Logs**

1. **Go to:** Supabase Dashboard → **Edge Functions** → **make-server-40d4d8fd** → **Logs**
2. **Look for every 5 minutes:**
   ```
   🔐 Auth Check - Received headers:
   ✅ External cron authenticated
   🔄 Processing pending emails...
   ✅ No pending emails to process
   ```

---

## 🔧 **Management Commands:**

### **View All Cron Jobs:**
```sql
SELECT * FROM cron.job;
```

### **View All Recent Runs:**
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

### **Delete Cron Job (if needed):**
```sql
SELECT cron.unschedule('resilio-email-scheduler');
```

### **Re-create Cron Job (after deleting):**
```sql
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT
        net.http_post(
            url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := '{}'::jsonb
        ) as request_id;
    $$
);
```

---

## ⚙️ **Change Schedule:**

### **Every 1 Minute (More Aggressive):**
```sql
-- Delete old job
SELECT cron.unschedule('resilio-email-scheduler');

-- Create with new schedule
SELECT cron.schedule(
    'resilio-email-scheduler',
    '* * * * *',  -- Every minute!
    $$ /* same http_post code */ $$
);
```

### **Every 10 Minutes:**
```sql
SELECT cron.unschedule('resilio-email-scheduler');
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/10 * * * *',  -- Every 10 minutes
    $$ /* same http_post code */ $$
);
```

### **Every Hour:**
```sql
SELECT cron.unschedule('resilio-email-scheduler');
SELECT cron.schedule(
    'resilio-email-scheduler',
    '0 * * * *',  -- Every hour at :00
    $$ /* same http_post code */ $$
);
```

---

## 📊 **Monitor Email Queue Status:**

### **Check Pending Emails:**
```sql
SELECT 
    id,
    recipient_email,
    type,
    status,
    scheduled_for,
    created_at,
    (scheduled_for <= NOW()) as is_due
FROM email_queue 
WHERE status = 'pending'
ORDER BY scheduled_for ASC;
```

### **Check Recently Sent:**
```sql
SELECT 
    id,
    recipient_email,
    type,
    status,
    scheduled_for,
    sent_at,
    (sent_at - scheduled_for) as delivery_delay
FROM email_queue 
WHERE status = 'sent'
ORDER BY sent_at DESC
LIMIT 10;
```

### **Check Failed Emails:**
```sql
SELECT 
    id,
    recipient_email,
    type,
    status,
    scheduled_for,
    retry_count,
    last_error,
    updated_at
FROM email_queue 
WHERE status = 'failed'
ORDER BY updated_at DESC;
```

---

## 🆘 **Troubleshooting:**

### **Error: "pg_cron extension not found"**

**Solution:**
```sql
-- Enable in SQL Editor:
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

**If still doesn't work:**
- Contact Supabase support to enable pg_cron on your project
- Or use frontend polling as fallback (already implemented)

---

### **Error: "pg_net extension not found"**

**Solution:**
```sql
-- Enable in SQL Editor:
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

### **Cron Job Not Running:**

**Check 1: Is it active?**
```sql
SELECT jobname, active FROM cron.job WHERE jobname = 'resilio-email-scheduler';
```

**If active = false:**
```sql
-- Re-create the job (delete and create again)
SELECT cron.unschedule('resilio-email-scheduler');
-- Then run the schedule command again
```

**Check 2: View error logs:**
```sql
SELECT 
    start_time,
    status,
    return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC
LIMIT 5;
```

---

### **Getting 401 Unauthorized in Logs:**

**Problem:** Wrong CRON_API_KEY in the URL

**Solution:**
1. Get correct key from Edge Function secrets
2. Delete cron job: `SELECT cron.unschedule('resilio-email-scheduler');`
3. Re-create with correct key in URL

---

### **No Emails Being Sent:**

**Check 1: Are there pending emails?**
```sql
SELECT * FROM email_queue WHERE status = 'pending' AND scheduled_for <= NOW();
```

**Check 2: Are SMTP credentials configured?**
```
Edge Functions → make-server-40d4d8fd → Settings → Secrets
```

Required secrets:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

**Check 3: Edge Function logs for errors:**
Dashboard → Edge Functions → Logs

---

## ✅ **Advantages of This Solution:**

| Feature | External Cron | **Supabase pg_cron** |
|---------|---------------|---------------------|
| **Setup Complexity** | Medium | ✅ Easy (just SQL) |
| **External Service** | Required | ❌ Not needed |
| **Cost** | May charge | ✅ Free (included) |
| **Reliability** | Depends | ✅ Built-in |
| **Maintenance** | High | ✅ Low |
| **Security** | API key exposure | ✅ Internal only |

---

## 🎯 **How It Works:**

```
┌─────────────────────────────────────────────────┐
│  Supabase PostgreSQL Database                   │
│  ┌───────────────────────────────────────────┐  │
│  │  pg_cron Extension                        │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Every 5 Minutes:                   │  │  │
│  │  │  1. Timer triggers                  │  │  │
│  │  │  2. pg_net makes HTTP POST         │  │  │
│  │  │  3. Calls Edge Function            │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTP POST with CRON_API_KEY
                  ▼
┌─────────────────────────────────────────────────┐
│  Edge Function: make-server-40d4d8fd            │
│  Route: /cron/check-scheduled-emails            │
│  ┌───────────────────────────────────────────┐  │
│  │  1. Authenticate request                  │  │
│  │  2. Query email_queue table              │  │
│  │  3. Find emails where scheduled_for <= NOW│  │
│  │  4. Send emails via SMTP                 │  │
│  │  5. Update status to 'sent'              │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🔄 **Backup: Frontend Polling**

**Already Implemented!** ✅

Frontend also polls every 5 minutes when user is logged in:
- Located in: `/App.tsx`
- Runs automatically
- No setup needed
- Works as backup when pg_cron is down

---

## 📚 **Summary:**

### **What You Get:**

1. ✅ **Automatic email scheduling** - No manual intervention
2. ✅ **Runs 24/7** - Even when no users online
3. ✅ **No external services** - Pure Supabase
4. ✅ **Easy to monitor** - SQL queries show status
5. ✅ **Reliable** - Built into PostgreSQL
6. ✅ **Free** - No extra cost

### **What to Do:**

1. ✅ Get CRON_API_KEY from Edge Function secrets
2. ✅ Run SQL setup (update the URL)
3. ✅ Verify cron job created
4. ✅ Wait 5 minutes and check logs
5. ✅ Done! Emails will send automatically

---

## 🎉 **Quick Start Checklist:**

- [ ] Got CRON_API_KEY from Supabase
- [ ] Opened SQL Editor
- [ ] Copied SQL code from `/SUPABASE_CRON_SETUP.sql`
- [ ] Updated URL with project ID and API key
- [ ] Ran the SQL query
- [ ] Verified cron job exists: `SELECT * FROM cron.job;`
- [ ] Waited 5 minutes
- [ ] Checked run history: `SELECT * FROM cron.job_run_details;`
- [ ] Verified Edge Function logs show triggers
- [ ] Tested by scheduling a test email

---

**Need Help?**

1. Check SQL Editor for error messages
2. Check Edge Function logs
3. Run troubleshooting queries above
4. Frontend polling still works as backup!

---

**Last Updated:** March 12, 2026  
**Status:** Production Ready  
**Requirements:** Supabase project with pg_cron enabled
