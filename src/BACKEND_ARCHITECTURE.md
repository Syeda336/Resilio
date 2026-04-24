# 🏗️ Backend Architecture - Supabase Email Scheduler

## 📊 Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Web App (Browser - React/TypeScript)                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │  │
│  │  │ Future     │  │ Reminders  │  │ Diet Plan  │            │  │
│  │  │ Self       │  │            │  │            │            │  │
│  │  │ Messages   │  │ Personal   │  │ Food DB    │            │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │  │
│  │        │                │                │                    │  │
│  │        └────────────────┴────────────────┘                    │  │
│  │                         │                                     │  │
│  │                         ▼                                     │  │
│  │           "Schedule Email" Button Click                      │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ HTTP POST Request
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLOUD (Server)                         │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │               PostgreSQL Database                               ││
│  │  ┌──────────────────────────────────────────────────────────┐ ││
│  │  │  email_queue Table                                       │ ││
│  │  │  ┌────────────────────────────────────────────────────┐ │ ││
│  │  │  │ id: UUID                                           │ │ ││
│  │  │  │ user_id: UUID                                      │ │ ││
│  │  │  │ user_email: TEXT                                   │ │ ││
│  │  │  │ email_type: TEXT (future_message, reminder, etc.) │ │ ││
│  │  │  │ message_content: TEXT                              │ │ ││
│  │  │  │ scheduled_for: TIMESTAMPTZ ⏰                      │ │ ││
│  │  │  │ status: TEXT (pending → sent)                      │ │ ││
│  │  │  │ sent_at: TIMESTAMPTZ                               │ │ ││
│  │  │  │ metadata: JSONB                                    │ │ ││
│  │  │  └────────────────────────────────────────────────────┘ │ ││
│  │  └──────────────────────────────────────────────────────────┘ ││
│  └────────────────────────────┬───────────────────────────────────┘│
│                               │                                     │
│  ┌────────────────────────────┼───────────────────────────────────┐│
│  │      pg_cron Extension     │                                   ││
│  │  ┌─────────────────────────▼───────────────────────────────┐ ││
│  │  │  CRON Job: resilio-email-scheduler                      │ ││
│  │  │  ┌──────────────────────────────────────────────────┐  │ ││
│  │  │  │ Schedule: */5 * * * * (Every 5 minutes)          │  │ ││
│  │  │  │ Active: true                                     │  │ ││
│  │  │  │ Runs 24/7/365                                    │  │ ││
│  │  │  └──────────────────────────────────────────────────┘  │ ││
│  │  │                       │                                 │ ││
│  │  │                       ▼                                 │ ││
│  │  │  Every 5 minutes:                                      │ ││
│  │  │  1. SELECT * FROM email_queue                          │ ││
│  │  │     WHERE status = 'pending'                           │ ││
│  │  │     AND scheduled_for <= NOW()                         │ ││
│  │  │                       │                                 │ ││
│  │  │                       ▼                                 │ ││
│  │  │  2. Call Edge Function via pg_net                      │ ││
│  │  └───────────────────────┬─────────────────────────────────┘ ││
│  └────────────────────────────┼───────────────────────────────────┘│
│                               │                                     │
│                               │ HTTP POST                           │
│                               ▼                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │              Edge Functions (Deno/TypeScript)                  ││
│  │  ┌──────────────────────────────────────────────────────────┐ ││
│  │  │  /functions/server/email_processor.tsx                   │ ││
│  │  │  ┌──────────────────────────────────────────────────┐   │ ││
│  │  │  │ 1. Receive CRON trigger                          │   │ ││
│  │  │  │ 2. Fetch pending emails from database            │   │ ││
│  │  │  │ 3. Process each email:                           │   │ ││
│  │  │  │    - Update status: pending → processing         │   │ ││
│  │  │  │    - Determine email type                        │   │ ││
│  │  │  │    - Call appropriate sender function            │   │ ││
│  │  │  │    - Update status: processing → sent/failed     │   │ ││
│  │  │  └──────────────────┬───────────────────────────────┘   │ ││
│  │  └────────────────────┼───────────────────────────────────┘ ││
│  │                       │                                       ││
│  │                       ▼                                       ││
│  │  ┌──────────────────────────────────────────────────────────┐ ││
│  │  │  /functions/server/email_nodemailer.tsx                  │ ││
│  │  │  ┌──────────────────────────────────────────────────┐   │ ││
│  │  │  │ Email Template Functions:                        │   │ ││
│  │  │  │                                                   │   │ ││
│  │  │  │ • sendFutureMessageEmail()                       │   │ ││
│  │  │  │   - Future Self Messages                         │   │ ││
│  │  │  │   - Beautiful HTML template                      │   │ ││
│  │  │  │                                                   │   │ ││
│  │  │  │ • sendReminderEmail()                            │   │ ││
│  │  │  │   - Personal Reminders                           │   │ ││
│  │  │  │   - Task details + time                          │   │ ││
│  │  │  │                                                   │   │ ││
│  │  │  │ • sendDietEmail()                                │   │ ││
│  │  │  │   - Food Database items                          │   │ ││
│  │  │  │   - Nutritional info                             │   │ ││
│  │  │  │                                                   │   │ ││
│  │  │  │ • sendMealEmail()                                │   │ ││
│  │  │  │   - Meal Planner items                           │   │ ││
│  │  │  │   - Meal description                             │   │ ││
│  │  │  └──────────────────┬───────────────────────────────┘   │ ││
│  │  └────────────────────┼───────────────────────────────────┘ ││
│  └───────────────────────┼──────────────────────────────────────┘│
│                          │                                        │
│  ┌───────────────────────▼──────────────────────────────────────┐│
│  │              SMTP Configuration (Secrets)                     ││
│  │  ┌──────────────────────────────────────────────────────┐   ││
│  │  │ SMTP_HOST = smtp.gmail.com                           │   ││
│  │  │ SMTP_PORT = 587                                      │   ││
│  │  │ SMTP_USER = your-email@gmail.com                     │   ││
│  │  │ SMTP_PASSWORD = your-app-password                    │   ││
│  │  │ SMTP_FROM = your-email@gmail.com                     │   ││
│  │  │ CRON_API_KEY = resilio-cron-2026-secure-key          │   ││
│  │  └──────────────────────────────────────────────────────┘   ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              │ SMTP Protocol
                              ▼
                    ┌──────────────────────┐
                    │   Gmail SMTP Server  │
                    │   (smtp.gmail.com)   │
                    └──────────┬───────────┘
                              │
                              │ Email Delivery
                              ▼
                    ┌──────────────────────┐
                    │   User Email Inbox   │
                    │   📧 Email Delivered │
                    └──────────────────────┘
```

---

## 🔄 Detailed Flow Sequence

### 1️⃣ User Schedules Email

```
User Action:
- Opens Future Self section
- Writes message: "Happy Birthday to me!"
- Sets date: April 15, 2026
- Sets time: 9:00 AM
- Clicks "Schedule"

Frontend (React):
- Collects form data
- Validates inputs
- Calls Supabase API

API Call:
POST /rest/v1/email_queue
{
  user_id: "abc-123...",
  user_email: "user@example.com",
  email_type: "future_message",
  message_content: "Happy Birthday to me!",
  scheduled_for: "2026-04-15T09:00:00Z",
  status: "pending",
  metadata: {
    scheduled_date: "April 15, 2026",
    ...
  }
}

Database:
- INSERT into email_queue
- Returns success ✅

User sees:
"✅ Message scheduled for April 15, 2026 at 9:00 AM"
```

---

### 2️⃣ CRON Job Monitors Queue

```
Every 5 minutes (00:00, 00:05, 00:10, ...):

CRON Job Executes:
┌──────────────────────────────┐
│ SELECT net.http_post(...)    │
│   url: Edge Function         │
│   endpoint: check-scheduled  │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│ Edge Function Triggered      │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│ Query Database:              │
│                              │
│ SELECT * FROM email_queue    │
│ WHERE status = 'pending'     │
│ AND scheduled_for <= NOW()   │
│ LIMIT 50                     │
└──────────────────────────────┘
              ↓
         Found emails?
         /          \
       YES          NO
        ↓            ↓
   Process      Return success
   Emails       (no action)
```

---

### 3️⃣ Email Processing

```
For each pending email:

Step 1: Update Status
┌──────────────────────────────┐
│ UPDATE email_queue           │
│ SET status = 'processing'    │
│ WHERE id = 'email-id'        │
└──────────────────────────────┘

Step 2: Determine Type
┌──────────────────────────────┐
│ email_type?                  │
│  • future_message            │
│  • reminder                  │
│  • diet                      │
│  • meal                      │
└──────────────────────────────┘

Step 3: Call Template Function
┌──────────────────────────────┐
│ sendFutureMessageEmail(...)  │
│   - userEmail                │
│   - message                  │
│   - scheduledDate            │
│   - userName                 │
└──────────────────────────────┘

Step 4: Send via SMTP
┌──────────────────────────────┐
│ nodemailer.sendMail({        │
│   from: SMTP_FROM,           │
│   to: userEmail,             │
│   subject: "...",            │
│   html: "..."                │
│ })                           │
└──────────────────────────────┘
              ↓
         Success?
         /      \
       YES      NO
        ↓        ↓
   Update    Update
   to sent   to failed

Step 5: Final Update
┌──────────────────────────────┐
│ UPDATE email_queue           │
│ SET status = 'sent'          │
│     sent_at = NOW()          │
│ WHERE id = 'email-id'        │
└──────────────────────────────┘
```

---

### 4️⃣ Email Delivery

```
SMTP Server:
┌──────────────────────────────┐
│ Gmail SMTP (smtp.gmail.com)  │
│                              │
│ • Authenticates sender       │
│ • Validates recipient        │
│ • Delivers email             │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│ User's Email Inbox           │
│                              │
│ 📬 Message from Your Past    │
│    Self                      │
│                              │
│ ⏰ Scheduled for:            │
│    April 15, 2026 9:00 AM   │
│                              │
│ "Happy Birthday to me!"      │
└──────────────────────────────┘
```

---

## 🗄️ Database Schema

### email_queue Table

```sql
CREATE TABLE email_queue (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User info
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  
  -- Email type and content
  email_type TEXT NOT NULL,
  -- Types: future_message, reminder, diet, meal
  
  message_content TEXT,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  -- ↑ CRITICAL: When to send the email
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  -- Values: pending → processing → sent/failed
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Stores: scheduled_date, scheduled_time, task, etc.
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_email_queue_status 
  ON email_queue(status);

CREATE INDEX idx_email_queue_scheduled 
  ON email_queue(scheduled_for) 
  WHERE status = 'pending';

CREATE INDEX idx_email_queue_user 
  ON email_queue(user_id);
```

---

## 🔐 Security Architecture

### API Key Protection

```
CRON Endpoint:
/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=XXX
                                                              ↑
                                                    Required API key

Validation:
┌──────────────────────────────────┐
│ if (req.url.searchParams.get(   │
│   'api_key') !== CRON_API_KEY)  │
│   return 401 Unauthorized        │
└──────────────────────────────────┘
```

### SMTP Secrets

```
Stored in Supabase Edge Function Secrets:
┌──────────────────────────────────┐
│ Never exposed to frontend        │
│ Only accessible server-side      │
│ Encrypted at rest                │
└──────────────────────────────────┘

Access:
const smtpPassword = Deno.env.get('SMTP_PASSWORD');
                     ↑ Server-side only
```

### Row Level Security (RLS)

```sql
-- Users can only see their own emails
CREATE POLICY "Users can view own emails"
ON email_queue FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only insert their own emails
CREATE POLICY "Users can insert own emails"
ON email_queue FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

---

## ⚡ Performance Optimizations

### 1. Batch Processing

```typescript
// Process up to 50 emails per CRON run
const { data: pendingEmails } = await supabase
  .from('email_queue')
  .select('*')
  .eq('status', 'pending')
  .lte('scheduled_for', now)
  .limit(50); // Batch size
```

### 2. Database Indexes

```sql
-- Fast lookup of pending emails
CREATE INDEX idx_email_queue_scheduled 
ON email_queue(scheduled_for) 
WHERE status = 'pending';

-- Query uses index:
EXPLAIN SELECT * FROM email_queue 
WHERE status = 'pending' 
AND scheduled_for <= NOW();

Result: Index Scan ✅ (Fast)
```

### 3. CRON Frequency

```
Current: Every 5 minutes
- 288 runs per day
- Acceptable delay: 0-5 minutes
- Low database load

Alternative: Every 1 minute
- 1,440 runs per day
- Acceptable delay: 0-1 minute
- Higher database load
```

---

## 📊 Monitoring Points

### Key Metrics to Track

```sql
-- 1. Queue Health
SELECT 
  status,
  COUNT(*) as count
FROM email_queue
GROUP BY status;

-- 2. Delivery Performance
SELECT 
  AVG(EXTRACT(EPOCH FROM (sent_at - scheduled_for))/60) as avg_delay_minutes
FROM email_queue
WHERE status = 'sent';

-- 3. CRON Reliability
SELECT 
  COUNT(*) as runs_last_hour
FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '1 hour';

-- 4. Error Rate
SELECT 
  COUNT(*) FILTER (WHERE status = 'failed') * 100.0 / COUNT(*) as error_rate
FROM email_queue
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

## 🔄 Email Lifecycle

```
┌─────────────┐
│   Created   │ ← User schedules email
└──────┬──────┘
       ↓
┌─────────────┐
│   Pending   │ ← Waiting for scheduled time
└──────┬──────┘
       ↓ (scheduled_for <= NOW)
┌─────────────┐
│ Processing  │ ← CRON picked up, sending
└──────┬──────┘
       ↓
   Success?
   /      \
 YES      NO
  ↓        ↓
┌────┐  ┌────────┐
│Sent│  │ Failed │
└────┘  └────────┘
  ↓        ↓
  ✅      Retry?
         /    \
       YES    NO
        ↓      ↓
    Pending  Failed
              (final)
```

---

## 🎯 Summary

### Core Components:

1. **Web App (Frontend)**
   - User interface
   - Schedule emails
   - React/TypeScript

2. **Database (PostgreSQL)**
   - email_queue table
   - Stores scheduled emails
   - Status tracking

3. **CRON Job (pg_cron)**
   - Runs every 5 minutes
   - Checks for pending emails
   - Triggers processing

4. **Edge Functions (Backend)**
   - email_processor.tsx
   - email_nodemailer.tsx
   - Sends emails via SMTP

5. **SMTP Server**
   - Gmail/Outlook
   - Delivers emails
   - Final delivery

### Key Features:

✅ **Automatic** - No manual intervention  
✅ **Reliable** - Built on Supabase infrastructure  
✅ **Scalable** - Handles multiple email types  
✅ **Secure** - API keys + RLS policies  
✅ **24/7** - Works without app being open  

---

**Architecture Status:** ✅ Production-Ready  
**Deployment Time:** ~15 minutes  
**Maintenance:** Minimal (automated)
