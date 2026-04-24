# 🔍 EMAIL QUEUE DEBUGGER - SQL DIAGNOSTICS

Run these SQL queries in **Supabase Dashboard → SQL Editor** to diagnose email queue issues:

---

## 1️⃣ Check if `email_queue` table exists

```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'email_queue'
) as table_exists;
```

**Expected:** `true`

**If `false`:** Run the CREATE TABLE script from `/TEST_EMAIL_QUEUE.md`

---

## 2️⃣ Count total emails in queue

```sql
SELECT 
  COUNT(*) as total_emails,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_emails,
  COUNT(*) FILTER (WHERE status = 'sent') as sent_emails,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_emails
FROM email_queue;
```

**If `total_emails` = 0:** No emails have been queued yet. Test by adding a food item/reminder/message.

---

## 3️⃣ View recent emails (all statuses)

```sql
SELECT 
  id,
  email_type,
  subject,
  user_email,
  status,
  scheduled_for,
  created_at,
  sent_at
FROM email_queue
ORDER BY created_at DESC
LIMIT 10;
```

**This shows your 10 most recent emails regardless of status.**

---

## 4️⃣ View pending emails (not yet sent)

```sql
SELECT 
  id,
  email_type,
  subject,
  user_email,
  scheduled_for,
  (scheduled_for - NOW()) as time_until_send,
  created_at
FROM email_queue
WHERE status = 'pending'
ORDER BY scheduled_for ASC;
```

**Time Until Send:**
- **Negative interval** = Email is overdue (should have been sent already)
- **Positive interval** = Email scheduled for future

---

## 5️⃣ Check YOUR user's emails

First, get your user ID:

```sql
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';
```

Copy your `id`, then run:

```sql
SELECT 
  id,
  email_type,
  subject,
  status,
  scheduled_for,
  created_at
FROM email_queue
WHERE user_id = 'PASTE_YOUR_USER_ID_HERE'
ORDER BY created_at DESC;
```

**If this returns 0 rows:** Emails are NOT being saved to the database!

---

## 6️⃣ Check RLS (Row Level Security) status

```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'email_queue';
```

**If `rowsecurity` = true:** RLS is enabled (might be blocking queries)

**Solution:**
```sql
ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;
```

---

## 7️⃣ View email queue table structure

```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'email_queue'
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid)
- user_id (uuid)
- user_email (text)
- user_name (text)
- email_type (text)
- subject (text)
- message_content (text)
- scheduled_for (timestamp with time zone)
- metadata (jsonb)
- status (text)
- sent_at (timestamp with time zone)
- error_message (text)
- retry_count (integer)
- created_at (timestamp with time zone)

---

## 8️⃣ Test direct insert (manual test)

Get your user ID first:
```sql
SELECT id, email FROM auth.users LIMIT 1;
```

Then test insert:
```sql
INSERT INTO email_queue (
  user_id,
  user_email,
  email_type,
  subject,
  message_content,
  scheduled_for,
  status
) VALUES (
  'YOUR_USER_ID_HERE',
  'YOUR_EMAIL@example.com',
  'diet_plan',
  '🍽️ Test Email from SQL',
  'This is a manual test insert',
  NOW() + INTERVAL '2 minutes',
  'pending'
) RETURNING *;
```

**If this WORKS:** Table is fine, problem is in backend code.
**If this FAILS:** Copy the EXACT error message.

---

## 9️⃣ Check for failed emails with errors

```sql
SELECT 
  id,
  email_type,
  subject,
  user_email,
  scheduled_for,
  error_message,
  retry_count
FROM email_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

**This shows WHY emails failed.**

---

## 🔟 Delete all test emails (cleanup)

**⚠️ WARNING: This deletes ALL emails! Use with caution!**

```sql
DELETE FROM email_queue WHERE status IN ('sent', 'failed');
```

Or delete only YOUR emails:
```sql
DELETE FROM email_queue 
WHERE user_id = 'YOUR_USER_ID_HERE' 
AND status IN ('sent', 'failed');
```

---

## 🎯 Common Issues & Solutions

### Issue 1: Table doesn't exist
```sql
-- Solution: Create the table
CREATE TABLE email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_name text,
  email_type text NOT NULL,
  subject text NOT NULL,
  message_content text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX email_queue_user_id_idx ON email_queue(user_id);
CREATE INDEX email_queue_status_idx ON email_queue(status);
CREATE INDEX email_queue_scheduled_for_idx ON email_queue(scheduled_for);

ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;
```

### Issue 2: RLS blocking inserts
```sql
-- Solution: Disable RLS
ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;
```

### Issue 3: Emails showing 0 but I added some
```sql
-- Check if emails exist but with different user_id
SELECT user_id, COUNT(*) 
FROM email_queue 
GROUP BY user_id;
```

This shows which user IDs have emails. If your user_id is different, authentication issue!

---

## 📊 Complete Diagnostic Query

Run this ONE query to see everything:

```sql
-- Full diagnostic report
WITH stats AS (
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'sent') as sent,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    MIN(created_at) as first_email,
    MAX(created_at) as last_email
  FROM email_queue
),
recent AS (
  SELECT 
    id,
    email_type,
    subject,
    status,
    scheduled_for,
    created_at
  FROM email_queue
  ORDER BY created_at DESC
  LIMIT 5
)
SELECT 
  '=== EMAIL QUEUE STATISTICS ===' as section,
  (SELECT total FROM stats) as total_emails,
  (SELECT pending FROM stats) as pending_emails,
  (SELECT sent FROM stats) as sent_emails,
  (SELECT failed FROM stats) as failed_emails,
  (SELECT first_email FROM stats) as first_email_created,
  (SELECT last_email FROM stats) as last_email_created
UNION ALL
SELECT 
  '=== RECENT EMAILS ===' as section,
  id::text,
  email_type,
  subject,
  status,
  scheduled_for::text,
  created_at::text
FROM recent;
```

---

## 🚀 Quick Test Script

Run this to verify everything is working:

```sql
-- 1. Check table exists
SELECT 'Table exists:' as check, 
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_queue')::text as result;

-- 2. Check RLS
SELECT 'RLS disabled:' as check,
       (NOT rowsecurity)::text as result
FROM pg_tables WHERE tablename = 'email_queue';

-- 3. Count emails
SELECT 'Total emails:' as check,
       COUNT(*)::text as result
FROM email_queue;

-- 4. Count pending
SELECT 'Pending emails:' as check,
       COUNT(*)::text as result
FROM email_queue WHERE status = 'pending';
```

**All should return positive results!**

---

## 📞 Support

After running these queries, share:

1. ✅ Result of Query #1 (table exists check)
2. ✅ Result of Query #2 (email counts)
3. ✅ Result of Query #3 (recent emails)
4. ✅ Result of Query #5 (YOUR user's emails)
5. ✅ Browser console logs from Email Queue Debugger

With these 5 things, I can tell you EXACTLY what's wrong! 🔍
