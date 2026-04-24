# 📧 Scheduled Email System - Setup Guide

## ✅ **Implementation Complete!**

Emails are now **queued and sent at scheduled date/time** instead of immediately.

---

## 🎯 **How It Works**

### **When You Create:**
1. **Future Self Message** → Email queued for scheduled date/time
2. **Personal Reminder** → Email queued for scheduled date/time
3. **Diet Plan (Food Database)** → Email queued for scheduled date/time
4. **Meal Planner** → Email queued for scheduled date/time

### **Email Queue Flow:**
```
User Saves → Backend Queues Email → Database Stores Job → Cron Worker Checks → Email Sent at Right Time
```

---

## 🔧 **Architecture**

### **Components:**

1. **Email Queue System** (`/supabase/functions/server/email_queue.tsx`)
   - `enqueueEmail()` - Add email to queue
   - `processPendingEmails()` - Send due emails
   - `retryFailedEmails()` - Retry failed sends
   - `getUserEmailQueue()` - View user's queue

2. **Cron Worker** (`/supabase/functions/server/scheduler.tsx`)
   - Runs periodically (every 5-15 minutes recommended)
   - Processes pending emails
   - Retries failed emails (max 3 attempts)

3. **Backend Endpoints** (Updated to use queue):
   - `/send-future-message-email` - Queues future messages
   - `/send-reminder-email` - Queues reminders
   - `/send-diet-email` - Queues diet notifications
   - `/send-meal-email` - Queues meal notifications

4. **Cron Endpoint:**
   - `/cron/check-scheduled-emails` - Processes email queue
   - Protected with `CRON_API_KEY`

---

## 🚀 **Setup Instructions**

### **Step 1: Environment Variables**
Make sure these are set in Supabase Edge Functions:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
CRON_API_KEY=your-secret-cron-key  # Generate a random string
```

### **Step 2: Setup Cron Job**

You have **2 options**:

#### **Option A: Use Cron-Job.org (Recommended - Free)**

1. Go to https://cron-job.org
2. Create a free account
3. Click **"Create Cron Job"**
4. Configure:
   - **Title:** Resilio Email Queue Processor
   - **URL:** `https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY`
   - **Schedule:** Every 5 minutes (or `*/5 * * * *`)
   - **HTTP Method:** GET
   - **Timezone:** Your timezone
5. Save and enable

#### **Option B: Use UptimeRobot (Free)**

1. Go to https://uptimerobot.com
2. Create a free account
3. Click **"Add New Monitor"**
4. Configure:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Resilio Email Cron
   - **URL:** `https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY`
   - **Monitoring Interval:** Every 5 minutes
5. Save

#### **Option C: Manual Testing (Development)**

Call the endpoint manually in browser or curl:
```bash
curl "https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY"
```

---

## 📊 **Database Schema**

The email queue uses the existing `email_queue` table:

```sql
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  email_type TEXT NOT NULL,  -- 'future_message', 'reminder', 'diet_plan', 'meal_plan'
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  status TEXT DEFAULT 'pending',  -- 'pending', 'processing', 'sent', 'failed'
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX idx_email_queue_status_scheduled ON email_queue(status, scheduled_for);
CREATE INDEX idx_email_queue_user ON email_queue(user_id);
```

---

## 🧪 **Testing**

### **Test 1: Create a Future Self Message**
1. Login to Resilio
2. Go to **Future Self Messaging**
3. Write a message
4. Set date/time for **5 minutes from now**
5. Save
6. Check browser console:
   ```
   ✅ Email queued successfully: {jobId: '...', scheduledFor: '2026-03-12T15:30:00Z'}
   ```

### **Test 2: Check Queue Status**
Call this in browser console:
```javascript
fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('resilio_access_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Queue:', data));
```

### **Test 3: Manually Trigger Cron**
Visit in browser (replace with your CRON_API_KEY):
```
https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY
```

Expected response:
```json
{
  "success": true,
  "results": {
    "queueProcessed": 1,
    "queueSent": 1,
    "queueFailed": 0,
    "retriedEmails": 0,
    "message": "Processed 1 emails: 1 sent, 0 failed"
  },
  "timestamp": "2026-03-12T15:30:05.123Z"
}
```

### **Test 4: Wait for Scheduled Time**
- Wait until the scheduled time
- Cron worker will process the queue
- Check your email inbox! 📬

---

## 🔍 **Monitoring**

### **Check Queue via API:**
```javascript
// Get user's pending emails
fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('resilio_access_token')}`
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

### **Server Logs:**
Check Supabase Edge Function logs for:
```
📅 Queueing email to: user@example.com for 2026-03-12T15:30:00Z
✅ Email queued successfully: abc-123-def
```

Then later (after cron runs):
```
🔄 Processing email queue...
📧 Found 1 pending emails to process
✅ Email sent: abc-123-def
📊 Queue processed: 1 sent, 0 failed
```

---

## ❓ **Troubleshooting**

### **Emails Not Sending:**
1. **Check SMTP credentials** in Supabase Edge Functions
2. **Verify CRON_API_KEY** is set correctly
3. **Make sure cron job is running** (check cron-job.org dashboard)
4. **Check server logs** in Supabase Dashboard → Edge Functions → Logs

### **"Unauthorized" Error:**
- CRON_API_KEY mismatch
- Make sure you're passing `?api_key=YOUR_KEY` or header `X-Cron-API-Key`

### **Emails Stuck in "pending":**
- Cron job not running
- SMTP credentials invalid
- Check `retry_count` and `error_message` in database

### **Check Failed Emails:**
```sql
SELECT * FROM email_queue WHERE status = 'failed' ORDER BY created_at DESC;
```

---

## 📈 **Performance**

- **Queue Processing:** ~50 emails per cron run
- **Cron Frequency:** Every 5-15 minutes recommended
- **Retry Logic:** Max 3 attempts for failed emails
- **Email Delivery:** Within 5-15 minutes of scheduled time (depending on cron frequency)

---

## 🎉 **Benefits**

✅ **Reliable:** Database-backed queue with retry mechanism  
✅ **Scalable:** Handles unlimited scheduled emails  
✅ **Trackable:** Full status tracking and history  
✅ **No External Dependency:** No need for external queue services  
✅ **Simple:** Just set up one cron job and forget!

---

**Setup Date:** March 12, 2026  
**Status:** ✅ Production Ready  
**Cron Frequency:** Every 5 minutes (recommended)
