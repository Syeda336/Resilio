# ⚡ Email Scheduling - Quick Start (5 Minutes)

## 🎯 Goal
Set up automatic email scheduling so emails send at the EXACT time you choose (not immediately).

---

## ✅ Step 1: Enable CRON Job (2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your Resilio project

2. **Click "SQL Editor"** (left sidebar)

3. **Copy & Paste This SQL:**

```sql
-- Enable CRON
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create email scheduler (runs every 5 minutes)
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

4. **Click "Run"** (or press Ctrl + Enter)

✅ **Done!** CRON job is now running every 5 minutes.

---

## ✅ Step 2: Verify Setup (1 minute)

**Run this to check CRON is active:**

```sql
SELECT jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'resilio-email-scheduler';
```

✅ **Expected Result:**
```
jobname: resilio-email-scheduler
schedule: */5 * * * *
active: true
```

---

## ✅ Step 3: Test It! (2 minutes)

1. **Open your Resilio app**
2. **Go to Future Self Messaging**
3. **Schedule a test message:**
   - Date: Today
   - Time: **5 minutes from now**
   - Message: "Test - This should arrive at [time]"
4. **Click "Schedule Message"**
5. **Wait 5-10 minutes**
6. **Check your email inbox** ✅

---

## 🎉 That's It!

Your email system is now **fully automated**!

### What Happens Now:

- ✅ **Future Self Messages** → Send at scheduled time
- ✅ **Personal Reminders** → Send at scheduled time
- ✅ **Diet Plan (Food Database)** → Send at scheduled time
- ✅ **Meal Planner** → Send at scheduled time

### How It Works:

1. User schedules email
2. Backend adds to queue
3. CRON checks every 5 minutes
4. Email sends when time arrives
5. Works even when app is closed! 🚀

---

## 📊 Monitor Emails (Optional)

**View pending emails:**
```sql
SELECT email_type, scheduled_for, status 
FROM email_queue 
WHERE status = 'pending';
```

**View sent emails:**
```sql
SELECT email_type, scheduled_for, sent_at 
FROM email_queue 
WHERE status = 'sent' 
ORDER BY sent_at DESC 
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Problem: Email not sending

**Check 1: Is SMTP configured?**
- Dashboard → Edge Functions → `server` → Settings
- Ensure `SMTP_PASSWORD` exists

**Check 2: Manual trigger**
```javascript
// Run in browser console (F12)
const token = localStorage.getItem('resilio_access_token');

fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## 📚 More Info

- **Complete Setup:** See `EMAIL_SCHEDULING_SETUP.md`
- **How Timing Works:** See `EMAIL_TIMING_GUIDE.md`
- **Detailed CRON Setup:** See `SUPABASE_CRON_SETUP.md`
- **Full Overview:** See `EMAIL_SYSTEM_SUMMARY.md`

---

**🎊 Enjoy your automated email system!**
