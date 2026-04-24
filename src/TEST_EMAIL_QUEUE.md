# 🔥 EMERGENCY DEBUG GUIDE - Email Queue Not Working

## Step 1: Check if email_queue table exists

Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

Run this:
```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'email_queue'
);
```

**Expected result:** `true`

**If result is `false`**, run this to create the table:

```sql
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
```

---

## Step 2: Check table structure

Run this:
```sql
SELECT column_name, data_type, is_nullable
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

## Step 3: Check RLS (Row Level Security) policies

Run this:
```sql
SELECT * FROM pg_policies WHERE tablename = 'email_queue';
```

**If RLS is enabled and blocking inserts**, disable it:
```sql
ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;
```

---

## Step 4: Test direct insert

Run this (replace with YOUR user_id and email):
```sql
INSERT INTO email_queue (
  user_id, 
  user_email, 
  user_name, 
  email_type, 
  subject, 
  message_content, 
  scheduled_for,
  status
) VALUES (
  'YOUR_USER_ID_HERE',  -- Get from: SELECT id FROM auth.users LIMIT 1;
  'your_email@example.com',
  'Test User',
  'diet_plan',
  'Test Email',
  'This is a test',
  NOW() + INTERVAL '5 minutes',
  'pending'
) RETURNING *;
```

**If this fails**, copy the EXACT error message.

---

## Step 5: Check Supabase Edge Function logs

1. Go to **Supabase Dashboard** → **Edge Functions** → **server**
2. Click **Logs** tab
3. Try adding a food item in your app
4. Watch for these logs:

```
🔍 [EMAIL DEBUG] Checking email queueing conditions: {...}
✅ [EMAIL DEBUG] All conditions met, proceeding with email queueing...
📦 [EMAIL DEBUG] Importing email_queue module...
✅ [EMAIL DEBUG] email_queue module imported successfully!
🚀 [EMAIL DEBUG] CALLING enqueueEmail NOW...
```

**If you see:**
- ❌ `No access token provided` → Logout and login again
- ❌ `Authentication failed` → Token expired, logout and login again
- ❌ `Failed to queue diet email` → Copy the full error message

---

## Step 6: Test from Browser Console

Open browser console and run:

```javascript
// Check if logged in
console.log('Token:', localStorage.getItem('resilio_access_token'));
console.log('Email:', localStorage.getItem('userEmail'));

// If both are null, you're not logged in - login first!
```

---

## Step 7: Check email_queue.tsx file exists

The backend imports: `./email_queue.tsx`

Make sure this file exists at:
`/supabase/functions/server/email_queue.tsx`

---

## Step 8: Manual test enqueueEmail

In Supabase SQL Editor, run:

```sql
-- First, get your user ID
SELECT id, email FROM auth.users LIMIT 1;
```

Copy your user ID, then test the queue:

```sql
INSERT INTO email_queue (
  user_id,
  user_email,
  email_type,
  subject,
  message_content,
  scheduled_for,
  metadata,
  status
) VALUES (
  'PASTE_YOUR_USER_ID_HERE',
  'PASTE_YOUR_EMAIL_HERE',
  'diet_plan',
  '🍽️ Test Diet Reminder',
  'This is a manual test',
  NOW() + INTERVAL '2 minutes',
  '{"test": true}'::jsonb,
  'pending'
) RETURNING *;
```

If this works, the table is fine. Problem is in the backend code.

If this FAILS, check the error message carefully.

---

## Step 9: Share debugging info

Run all these queries and share results:

```sql
-- 1. Check if table exists
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_queue');

-- 2. Count existing emails
SELECT COUNT(*) as total_emails FROM email_queue;

-- 3. Check recent emails
SELECT id, user_email, email_type, status, scheduled_for, created_at 
FROM email_queue 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check for any errors
SELECT id, email_type, status, error_message 
FROM email_queue 
WHERE status = 'failed'
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🚨 MOST COMMON ISSUES:

### Issue 1: Table doesn't exist
**Solution:** Run CREATE TABLE script from Step 1

### Issue 2: RLS blocking inserts
**Solution:** Run `ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;`

### Issue 3: Not logged in
**Solution:** Logout completely, clear cache, login again

### Issue 4: Token expired
**Solution:** Logout and login again

### Issue 5: email_queue.tsx file missing
**Solution:** File should exist at `/supabase/functions/server/email_queue.tsx`

---

## 📞 Emergency Contact Info

If NONE of these work, share:

1. ✅ Result of Step 1 (table exists check)
2. ✅ Browser console logs when adding food
3. ✅ Supabase Edge Function logs
4. ✅ Alert message you see
5. ✅ Screenshot of email_queue table

I'll fix it IMMEDIATELY! 🚀
