# 🧪 Test Endpoints - Immediate Testing

Yeh endpoints browser mein directly test kar sakte ho (NO AUTH REQUIRED):

---

## ✅ Step 1: Test Health Check

```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Resilio server is running!",
  "timestamp": "2026-03-11T...",
  "environment": {
    "SMTP_PASSWORD_SET": true,
    "CRON_API_KEY_SET": true,
    "SUPABASE_URL_SET": true
  }
}
```

✅ **If this works** = Server is running!

---

## ✅ Step 2: Test Email Queue Status

```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status
```

**Expected Response:**
```json
{
  "success": true,
  "currentTime": "2026-03-11T...",
  "summary": {
    "total": 0,
    "pending": 0,
    "dueNow": 0,
    "upcoming": 0,
    "sent": 0,
    "failed": 0
  }
}
```

✅ **If this works** = Email Queue System is ready!

---

## 🚨 If You Get "Missing authorization header" Error

Supabase Edge Functions ka issue hai. Fix:

### Option 1: Direct SQL Query (Immediate)

Supabase Dashboard → SQL Editor → Run:

```sql
SELECT 
  status,
  COUNT(*) as count,
  MIN(scheduled_for) as next_scheduled
FROM email_queue
GROUP BY status;
```

Yeh aapko queue status directly dikhayega!

---

### Option 2: Add API Key to URL

```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status
```

Header add karen:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1emJ1eGVxcXVib2x1amp0aXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4NzUyMDAsImV4cCI6MjAyMjQ1MTIwMH0.9kH-PXMuUO8Vf9G8aJvL3S-U6Z9Z9qKZGZ0qZ9qZ9qI
```

(Yeh aapka SUPABASE_ANON_KEY hai)

---

## ✅ Step 3: Create Test Future Message

Resilio app mein:

1. Login karen
2. **Future Self Messaging** section
3. Message: `"Testing email queue!"`
4. Date: **Today**
5. Time: **Current time + 2 minutes**
6. Click **"Schedule Message"**

---

## ✅ Step 4: Verify in Database

Supabase Dashboard → Table Editor → `email_queue` table

Yeh dikhna chahiye:
- 1 row with status = 'pending'
- scheduled_for = your selected time
- email_type = 'future_message'

---

## ✅ Step 5: Wait for Scheduled Time

Jab scheduled time aa jaye, manually process karen:

### Using cURL:

```bash
curl -X POST "https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/process?api_key=YOUR_CRON_API_KEY"
```

### Using Browser (if CRON_API_KEY is set):

```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/process?api_key=YOUR_CRON_API_KEY
```

(Replace `YOUR_CRON_API_KEY` with actual key from Supabase env vars)

---

## ✅ Step 6: Check Email Was Sent

### Method 1: SQL Query

```sql
SELECT * FROM email_queue WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 5;
```

### Method 2: Check Inbox

Email aana chahiye with subject: **"📬 Message from Your Past Self"**

---

## 🎯 Quick Verification SQL Queries

### Count Emails by Status
```sql
SELECT status, COUNT(*) FROM email_queue GROUP BY status;
```

### Next 5 Scheduled Emails
```sql
SELECT 
  id,
  user_email,
  email_type,
  scheduled_for,
  status
FROM email_queue 
WHERE status = 'pending'
ORDER BY scheduled_for ASC
LIMIT 5;
```

### Recently Sent Emails
```sql
SELECT 
  user_email,
  email_type,
  scheduled_for,
  sent_at,
  EXTRACT(EPOCH FROM (sent_at - scheduled_for)) as delay_seconds
FROM email_queue 
WHERE status = 'sent'
ORDER BY sent_at DESC
LIMIT 5;
```

### Failed Emails
```sql
SELECT 
  user_email,
  email_type,
  error_message,
  retry_count,
  scheduled_for
FROM email_queue 
WHERE status = 'failed';
```

---

## 📊 Expected Timeline

```
10:30:00 - Create future message in app
10:30:01 - Message saved to kv_store
10:30:01 - Email queued in email_queue table (status='pending')
10:30:05 - Verify in database: SELECT * FROM email_queue;

[Wait for scheduled time - 10:32:00]

10:32:00 - Run process endpoint manually OR wait for cron
10:32:05 - Email sent via SMTP
10:32:06 - Database updated (status='sent', sent_at=NOW())
10:32:10 - Email arrives in inbox ✅
```

---

## 🎉 Success Indicators

✅ **Database Level:**
- Row exists in `email_queue` table
- Status changes from 'pending' → 'sent'
- `sent_at` timestamp is set

✅ **Email Level:**
- Email arrives in inbox
- Subject line correct
- Content correct
- Timing is accurate

✅ **System Level:**
- No errors in Supabase logs
- Cron job running smoothly
- Queue processing works

---

**Now test karna start karen! Sabse pehle health endpoint test karen.** 🚀
