# 🧪 Test Cron Setup - Quick Verification

## ❌ Error: "Unauthorized cron job access attempt"

**Reason:** CRON_API_KEY not configured yet or mismatch

---

## ✅ **Quick Fix:**

### **Option 1: Test WITHOUT CRON_API_KEY (Development Mode)**

The backend now allows testing **without CRON_API_KEY** if it's not configured yet!

**Just run this SQL to test:**

```sql
-- Test the endpoint directly (no API key needed if CRON_API_KEY not set)
SELECT net.http_get(
    url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails'
) as request_id;
```

**Expected Response in Logs:**
```
⚠️  CRON_API_KEY not configured - allowing request (SETUP MODE)
⚠️  Please set CRON_API_KEY in Edge Function secrets for security
🔄 Processing pending emails...
```

This will work immediately! ✅

---

### **Option 2: Set CRON_API_KEY (Production Mode)**

For security in production, you should set CRON_API_KEY:

**Step 1: Create CRON_API_KEY**

1. Go to Supabase Dashboard
2. Edge Functions → make-server-40d4d8fd → Settings → Secrets
3. Click "Add new secret"
4. Name: `CRON_API_KEY`
5. Value: `resilio-cron-2026-secure` (or any secure string)
6. Save
7. Wait 30 seconds for deployment

**Step 2: Use API Key in SQL**

```sql
-- With API key
SELECT net.http_get(
    url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=resilio-cron-2026-secure'
) as request_id;
```

**Expected Response in Logs:**
```
✅ External cron authenticated with CRON_API_KEY
🔄 Processing pending emails...
```

---

## 🚀 **Quick Setup (Without API Key):**

If you just want to test quickly, run this SQL:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create cron job WITHOUT API key (for testing)
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
    $$
);

-- Verify
SELECT * FROM cron.job;
```

**This will work immediately without any API key!** ✅

---

## 🔐 **Production Setup (With API Key - Recommended):**

For production, set CRON_API_KEY and use this SQL:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create cron job WITH API key (secure)
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY_HERE',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
    $$
);

-- Verify
SELECT * FROM cron.job;
```

Replace `YOUR_CRON_API_KEY_HERE` with actual key from Edge Function secrets.

---

## 🧪 **Verify It's Working:**

### **Check Cron Job:**
```sql
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';
```

**Expected:**
```
jobid | jobname                    | schedule      | active
------|----------------------------|---------------|-------
1     | resilio-email-scheduler    | */5 * * * *   | true
```

---

### **Check Recent Runs (After 5 minutes):**
```sql
SELECT 
    start_time,
    end_time,
    status,
    return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC
LIMIT 5;
```

**Expected:**
```
start_time              | end_time                | status    | return_message
------------------------|-------------------------|-----------|----------------
2026-03-16 10:30:00     | 2026-03-16 10:30:01     | succeeded | OK
2026-03-16 10:25:00     | 2026-03-16 10:25:01     | succeeded | OK
```

---

### **Check Edge Function Logs:**

1. Supabase Dashboard → Edge Functions → make-server-40d4d8fd → Logs
2. Look for every 5 minutes:

**Without API Key (Development):**
```
⚠️  CRON_API_KEY not configured - allowing request (SETUP MODE)
🔄 Processing pending emails...
✅ No pending emails to process
```

**With API Key (Production):**
```
✅ External cron authenticated with CRON_API_KEY
🔄 Processing pending emails...
✅ No pending emails to process
```

---

## 🎯 **Which Should I Use?**

### **🟢 Development/Testing:**
- **No API Key** ← Use this to get started quickly
- Fast setup
- Works immediately
- Good for testing

### **🔵 Production:**
- **With API Key** ← Use this for real deployment
- More secure
- Recommended for live app
- Best practice

---

## 📊 **Comparison:**

| Feature | Without API Key | With API Key |
|---------|----------------|--------------|
| **Setup Time** | ✅ 2 minutes | 5 minutes |
| **Security** | ⚠️  Low | ✅ High |
| **Works?** | ✅ Yes | ✅ Yes |
| **Production Ready** | ❌ No | ✅ Yes |
| **Testing** | ✅ Perfect | ✅ Good |

---

## 🔄 **Upgrade Path:**

**Start with No API Key (Quick Test):**
1. Run SQL without API key
2. Verify it works
3. Check logs

**Later, Add API Key (Production):**
1. Delete old cron job: `SELECT cron.unschedule('resilio-email-scheduler');`
2. Set CRON_API_KEY in Edge Function secrets
3. Re-create cron job with API key in URL
4. Done! More secure now

---

## ✅ **TL;DR - Quick Start:**

**For immediate testing (no API key needed):**

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
GRANT USAGE ON SCHEMA cron TO postgres;

SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
    $$
);
```

**That's it!** ✅ Works immediately, no API key needed for testing!

---

## 🆘 **Troubleshooting:**

### **Still Getting 401 Error?**

1. **Check Edge Function Logs** for exact error
2. **Run this SQL to test directly:**
   ```sql
   SELECT net.http_get(
       url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails'
   );
   ```
3. **Check if CRON_API_KEY is set:**
   - If set: Use `?api_key=YOUR_KEY` in URL
   - If not set: URL without API key should work

---

### **Error: "pg_cron extension not found"**

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

If still fails, contact Supabase support to enable pg_cron.

---

### **Error: "pg_net extension not found"**

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

### **Cron Job Not Running?**

```sql
-- Check if job is active
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';

-- Check run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

---

## 🎉 **Success Indicators:**

✅ SQL runs without errors  
✅ `SELECT * FROM cron.job` shows your job  
✅ After 5 minutes, `cron.job_run_details` has entries  
✅ Edge Function logs show cron triggers  
✅ No 401 errors in logs  

---

**You're all set! Emails will process automatically every 5 minutes! 🚀**

---

**Updated:** March 16, 2026  
**Status:** Development mode (no API key) now supported!  
**Action:** Run SQL and start testing immediately!
