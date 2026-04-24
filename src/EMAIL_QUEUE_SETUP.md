# 📧 Email Queue System - Setup Guide

Resilio ab **professional email queue system** use karta hai jo **database-backed job queue** ke through scheduled emails bhejta hai. Yeh Celery/Sidekiq/BullMQ jaisi industry-standard approach follow karta hai but **serverless environment** ke liye optimized hai.

---

## 🎯 Architecture Overview

```
┌─────────────────┐
│  User Creates   │
│ Future Message  │
│  or Reminder    │
└────────┬────────┘
         │
         ▼
┌────────────────────────┐
│  App Server            │
│  1. Saves to KV Store  │
│  2. Adds to Email Queue│
│     (PostgreSQL Table) │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│   Email Queue Table    │
│  status: 'pending'     │
│  scheduled_for: DATE   │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Cron Job (External)   │
│  Calls every minute:   │
│  /email/queue/process  │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Worker Process        │
│  1. Fetches due emails │
│  2. Sends via SMTP     │
│  3. Updates status     │
└────────────────────────┘
```

---

## 🔥 Features

✅ **Database-backed queue** - PostgreSQL table stores all scheduled emails  
✅ **Retry mechanism** - Failed emails automatically retry (max 3 attempts)  
✅ **Status tracking** - `pending`, `processing`, `sent`, `failed`  
✅ **Batch processing** - Processes up to 50 emails per run  
✅ **Error logging** - Stores error messages for debugging  
✅ **Zero external dependencies** - No Redis, no external queue service needed  
✅ **Serverless compatible** - Works with Supabase Edge Functions  

---

## 📊 Database Schema

### `email_queue` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who scheduled the email |
| `user_email` | TEXT | Recipient email address |
| `user_name` | TEXT | Recipient name |
| `email_type` | TEXT | `future_message` or `reminder` |
| `subject` | TEXT | Email subject line |
| `message_content` | TEXT | Email body content |
| `scheduled_for` | TIMESTAMPTZ | When to send the email |
| `created_at` | TIMESTAMPTZ | When the job was created |
| `sent_at` | TIMESTAMPTZ | When the email was sent |
| `status` | TEXT | `pending`, `processing`, `sent`, `failed` |
| `error_message` | TEXT | Error details if failed |
| `retry_count` | INTEGER | Number of retry attempts |
| `metadata` | JSONB | Additional data |

---

## 🛠️ Setup Instructions

### Step 1: Run Database Migration

Supabase Dashboard mein jaayein aur SQL Editor open karein:

```sql
-- Copy paste the contents of /supabase/migrations/setup_email_queue.sql
-- Run the migration
```

**Ya directly file run karein:**
1. Supabase Dashboard → SQL Editor
2. "+ New Query" click karein
3. `/supabase/migrations/setup_email_queue.sql` file ka content paste karein
4. "Run" button click karein

### Step 2: Configure Cron Job

**Option A: cron-job.org (Recommended)**

1. https://cron-job.org par jaayein
2. Sign up / Login karein
3. "Create cronjob" click karein
4. Configure karein:
   - **Title:** Resilio Email Queue Processor
   - **URL:** `https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/process`
   - **Schedule:** `* * * * *` (every minute)
   - **Request Method:** POST
   - **Headers:**
     ```
     X-Cron-API-Key: YOUR_CRON_API_KEY
     ```
   - **Notifications:** Enable email notifications for failures

**Option B: EasyCron**

1. https://www.easycron.com par jaayein
2. "Add Cron Job" click karein
3. Configure:
   - **URL:** Same as above
   - **Cron Expression:** `* * * * *`
   - **HTTP Method:** POST
   - **HTTP Headers:** `X-Cron-API-Key: YOUR_CRON_API_KEY`

**Option C: Supabase pg_cron (Paid Plans Only)**

Agar aapke paas Supabase Pro plan hai:

```sql
SELECT cron.schedule(
  'process-emails',
  '* * * * *',  -- Every minute
  $$SELECT process_pending_emails()$$
);
```

### Step 3: Verify Setup

Test endpoint call karen:

```bash
curl -X POST \
  "https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/process?api_key=YOUR_CRON_API_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "processed": 0,
  "sent": 0,
  "failed": 0,
  "message": "No pending emails"
}
```

---

## 📝 How It Works

### 1. Email Creation Flow

Jab user Future Message ya Reminder create karta hai:

```typescript
// Automatically queued in database
await enqueueEmail({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  emailType: 'future_message',
  subject: '📬 Message from Your Past Self',
  messageContent: 'Your message here',
  scheduledFor: new Date('2026-12-25 10:00'),
  metadata: { messageId: '...' }
});
```

### 2. Queue Processing (Every Minute)

Cron job calls `/email/queue/process`:

1. Fetches all pending emails where `scheduled_for <= NOW()`
2. Processes up to 50 emails in batch
3. For each email:
   - Updates status to `processing`
   - Sends via Gmail SMTP
   - Updates status to `sent` or `failed`
   - Logs any errors

### 3. Retry Failed Emails

Failed emails automatically retry:

```typescript
// Manual retry (optional)
await retryFailedEmails(maxRetries: 3);
```

---

## 🧪 Testing

### Test 1: Create a Future Message

App mein ek future message create karein with scheduled time 2-3 minutes in the future.

### Test 2: Check Queue

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue"
```

### Test 3: Manually Process Queue

```bash
curl -X POST \
  "https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/process?api_key=YOUR_CRON_API_KEY"
```

### Test 4: Check Database

Supabase Dashboard → Table Editor → `email_queue` table:
- Pending emails dikhayenge
- Status track kar sakte ho
- Error messages dekh sakte ho

---

## 🔍 Monitoring

### Check Queue Status

```sql
SELECT 
  status,
  COUNT(*) as count,
  MIN(scheduled_for) as next_scheduled
FROM email_queue
GROUP BY status;
```

### View Failed Emails

```sql
SELECT 
  id,
  user_email,
  email_type,
  error_message,
  retry_count,
  scheduled_for
FROM email_queue
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### View Processing Stats

```sql
SELECT 
  email_type,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending
FROM email_queue
GROUP BY email_type;
```

---

## 🚨 Troubleshooting

### Problem: Emails not being sent

**Check 1:** Cron job chal raha hai?
```bash
# cron-job.org dashboard check karein
# Ya manually call karke test karein
```

**Check 2:** SMTP credentials correct hain?
```bash
curl "https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/health"
```

**Check 3:** Database mein emails pending hain?
```sql
SELECT COUNT(*) FROM email_queue WHERE status = 'pending';
```

### Problem: Emails failing

```sql
-- Error messages dekhen
SELECT error_message, COUNT(*) 
FROM email_queue 
WHERE status = 'failed' 
GROUP BY error_message;
```

### Problem: Duplicate emails

```sql
-- Duplicate entries check karein
SELECT user_email, message_content, COUNT(*) 
FROM email_queue 
WHERE status = 'sent'
GROUP BY user_email, message_content 
HAVING COUNT(*) > 1;
```

---

## 📚 API Endpoints

### User Endpoints (Require Auth)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/email/queue` | GET | Get user's email queue |
| `/email/queue/:id` | DELETE | Cancel scheduled email |

### Admin Endpoints (Require CRON_API_KEY)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/email/queue/process` | POST | Process pending emails |
| `/email/queue/retry` | POST | Retry failed emails |

---

## 🎨 Advantages Over Cron-based System

| Feature | Old (Cron + KV) | New (Queue + DB) |
|---------|-----------------|------------------|
| **Reliability** | ⚠️ May skip emails | ✅ Persistent queue |
| **Retry** | ❌ No retry | ✅ Auto retry (3x) |
| **Monitoring** | ❌ No visibility | ✅ Full visibility |
| **Scaling** | ❌ All-or-nothing | ✅ Batch processing |
| **Error Tracking** | ❌ Lost errors | ✅ Logged errors |
| **Status** | ❌ Binary sent/not sent | ✅ 4-state tracking |

---

## 🔒 Security

✅ **CRON_API_KEY** protects queue processing endpoint  
✅ **User Auth** required for viewing/canceling own emails  
✅ **Row-level security** filters emails by user_id  
✅ **Service role** used for worker processes  

---

## 🚀 Production Checklist

- [ ] Database migration run ho gaya
- [ ] Cron job setup aur test ho gaya
- [ ] SMTP credentials verified hain
- [ ] Test email successfully sent
- [ ] Monitoring queries save kar liye
- [ ] Error notification email setup
- [ ] Backup cron service configured (redundancy)

---

## 💡 Next Steps

1. ✅ Test karo - Future message create kar ke wait karo
2. ✅ Monitor karo - Database mein status check karo
3. ✅ Alerts setup karo - Failed emails ke liye notifications
4. ✅ Scale karo - Jyada users ke liye batch size badha sakte ho

---

**Questions? Issues? Check the logs:**
- Supabase Dashboard → Logs → Edge Functions
- Email queue table → error_message column

**Happy Scheduling! 🎉**
