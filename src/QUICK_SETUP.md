# ⚡ Email Scheduler - Quick Setup (No External Cron!)

## 🎯 **Goal:**
Automatic email delivery har 5 minutes - completely Supabase ke andar!

---

## 📝 **Setup (2 Minutes):**

### **Step 1: Get API Key**

1. Supabase Dashboard → **Edge Functions** → **make-server-40d4d8fd** → **Settings** → **Secrets**
2. Find `CRON_API_KEY` and copy it
3. If not exists: Create it with value `resilio-cron-2026-secure` and copy

---

### **Step 2: Run This SQL**

1. Supabase Dashboard → **SQL Editor** → **New Query**
2. **Paste this** (replace `YOUR_KEY` with actual key from Step 1):

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create email scheduler (REPLACE YOUR_KEY!)
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
    $$
);

-- Verify
SELECT * FROM cron.job;
```

3. Click **Run**
4. **Done!** ✅

---

## ✅ **Verify It's Working:**

### **Check 1: Job Created**
```sql
SELECT jobname, schedule, active FROM cron.job;
```

**Expected:** `resilio-email-scheduler | */5 * * * * | true`

---

### **Check 2: After 5-10 Minutes**
```sql
SELECT 
    start_time, 
    status, 
    return_message 
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 5;
```

**Expected:** Multiple rows with `status = succeeded`

---

### **Check 3: Edge Function Logs**

Dashboard → Edge Functions → Logs

**Look for:**
```
✅ External cron authenticated
🔄 Processing pending emails...
```

---

## 🎉 **That's It!**

Your email scheduler is now running 24/7 inside Supabase!

- ✅ No external services
- ✅ Completely automatic
- ✅ Runs every 5 minutes
- ✅ Frontend polling also works as backup

---

## 📚 **More Info:**

- **Detailed Guide:** `/INTERNAL_CRON_GUIDE.md`
- **SQL File:** `/SUPABASE_CRON_SETUP.sql`
- **Troubleshooting:** `/INTERNAL_CRON_GUIDE.md` (Troubleshooting section)

---

## 🔧 **Management:**

### **View Runs:**
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### **Delete Job:**
```sql
SELECT cron.unschedule('resilio-email-scheduler');
```

### **Change to Every Minute:**
```sql
-- First delete
SELECT cron.unschedule('resilio-email-scheduler');

-- Then re-create with new schedule
SELECT cron.schedule(
    'resilio-email-scheduler',
    '* * * * *',  -- Every minute
    $$ /* same code */ $$
);
```

---

## ⚠️ **Important:**

- Replace `YOUR_KEY` with actual CRON_API_KEY
- Wait 5 minutes after setup to see first run
- Frontend polling still works as backup
- Check Edge Function logs if issues

---

**Ready to go! 🚀**
