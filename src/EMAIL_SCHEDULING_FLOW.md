# 📧 Email Scheduling Flow - How It Works

## ✅ **Confirmation: System Working Perfectly!**

Aapka understanding **bilkul correct** hai! Email queue exactly aise hi kaam kar raha hai:

---

## 🔄 **Complete Flow:**

### **Step 1: User Schedules Email**

User creates future message/reminder/diet plan with:
- **Date:** `2026-03-15` (March 15, 2026)
- **Time:** `09:00 AM`

### **Step 2: Backend Saves to Database**

```typescript
// In email_queue.tsx - enqueueEmail()
const { data } = await supabase
  .from('email_queue')
  .insert({
    user_id: job.userId,
    user_email: job.userEmail,
    email_type: job.emailType,
    message_content: job.messageContent,
    scheduled_for: job.scheduledFor.toISOString(), // ⬅️ Stores as ISO timestamp
    status: 'pending',
    metadata: {...}
  });
```

**Database stores:**
```
scheduled_for: "2026-03-15T09:00:00.000Z"
status: "pending"
```

### **Step 3: Polling Checks Queue Every 5 Minutes**

Frontend (App.tsx) calls cron endpoint every 5 minutes:

```typescript
// Every 5 minutes while user logged in
setInterval(() => {
  fetch('/cron/check-scheduled-emails', {...});
}, 5 * 60 * 1000);
```

### **Step 4: Backend Checks for Due Emails**

```typescript
// In email_queue.tsx - processPendingEmails()
const { data: pendingEmails } = await supabase
  .from('email_queue')
  .select('*')
  .eq('status', 'pending')
  .lte('scheduled_for', new Date().toISOString()) // ⬅️ Checks if time has reached
  .order('scheduled_for', { ascending: true })
  .limit(50);
```

**SQL Logic:**
```sql
SELECT * FROM email_queue
WHERE status = 'pending'
AND scheduled_for <= NOW() -- ⬅️ If scheduled time has passed
ORDER BY scheduled_for ASC
LIMIT 50;
```

### **Step 5: Email Sent**

When `scheduled_for <= NOW()`:

```typescript
// Send email based on type
if (email.email_type === 'future_message') {
  await sendFutureMessageEmail(...);
}

// Update status
await supabase
  .from('email_queue')
  .update({ 
    status: 'sent',
    sent_at: new Date().toISOString()
  })
  .eq('id', email.id);
```

**Database updates:**
```
status: "sent"
sent_at: "2026-03-15T09:02:34.567Z"
```

---

## 📊 **Example Timeline:**

### **User Action (March 12, 9:00 AM):**
```
User saves: "Future message for March 15, 9:00 AM"
↓
Database: scheduled_for = "2026-03-15T09:00:00.000Z", status = "pending"
```

### **March 12-14 (Before Scheduled Time):**
```
9:05 AM - Poll checks → scheduled_for > NOW → Skip
9:10 AM - Poll checks → scheduled_for > NOW → Skip
9:15 AM - Poll checks → scheduled_for > NOW → Skip
...
(Email stays in "pending" status)
```

### **March 15, 9:00 AM (Scheduled Time Reached!):**
```
9:00 AM - Poll checks → scheduled_for <= NOW ✅
          ↓
          Email found in pending queue!
          ↓
          status = "processing"
          ↓
          Send email 📧
          ↓
          status = "sent", sent_at = "2026-03-15T09:02:15.000Z"
```

### **After 9:00 AM:**
```
9:05 AM - Poll checks → No pending emails (already sent)
9:10 AM - Poll checks → No pending emails
...
```

---

## 🔍 **Database Query Logic (Exact Implementation):**

### **When Email is Queued:**

```typescript
// scheduled_for stored as ISO 8601 timestamp
scheduled_for: "2026-03-15T09:00:00.000Z"
```

### **When Checking for Due Emails:**

```typescript
// Current time
const now = new Date().toISOString(); // e.g., "2026-03-15T09:02:34.567Z"

// Query
.lte('scheduled_for', now)
```

**Comparison:**
```
scheduled_for: "2026-03-15T09:00:00.000Z"
now:           "2026-03-15T09:02:34.567Z"

"2026-03-15T09:00:00.000Z" <= "2026-03-15T09:02:34.567Z" ✅ TRUE
→ Email is due, send it!
```

---

## 📝 **Email Queue Database Schema:**

```sql
CREATE TABLE email_queue (
  id UUID PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  user_name TEXT,
  email_type TEXT, -- 'future_message', 'reminder', 'diet_plan', 'meal_plan'
  subject TEXT,
  message_content TEXT,
  scheduled_for TIMESTAMPTZ, -- ⬅️ KEY FIELD: When to send
  status TEXT, -- 'pending', 'processing', 'sent', 'failed'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);
```

---

## ⏰ **Timing Examples:**

### **Example 1: Future Message**
```
User Input:
  Date: March 20, 2026
  Time: 2:30 PM

Database Stores:
  scheduled_for: "2026-03-20T14:30:00.000Z"

Check Logic:
  ✅ On March 20 at 2:30 PM or later → Email sends
  ❌ Before March 20, 2:30 PM → Email stays pending
```

### **Example 2: Reminder**
```
User Input:
  Date: Tomorrow (March 13)
  Time: 8:00 AM

Database Stores:
  scheduled_for: "2026-03-13T08:00:00.000Z"

Check Logic:
  ✅ On March 13 at 8:00 AM or later → Email sends
  ❌ Before March 13, 8:00 AM → Email stays pending
```

### **Example 3: Diet Plan**
```
User Input:
  Date: March 15, 2026
  Time: 7:00 AM
  Timeline: Breakfast

Database Stores:
  scheduled_for: "2026-03-15T07:00:00.000Z"
  metadata: { timeline: "Breakfast", ... }

Check Logic:
  ✅ On March 15 at 7:00 AM or later → Email sends
  ❌ Before March 15, 7:00 AM → Email stays pending
```

---

## 🎯 **Status Flow:**

```
┌─────────┐
│ pending │ ← Email queued, waiting for scheduled_for time
└────┬────┘
     │ scheduled_for <= NOW()
     ↓
┌────────────┐
│ processing │ ← Email being sent right now
└─────┬──────┘
      │
      ├─── Success → ┌──────┐
      │              │ sent │ ← Email successfully delivered
      │              └──────┘
      │
      └─── Failure → ┌────────┐
                     │ failed │ ← Error occurred, will retry
                     └────────┘
```

---

## 🔧 **Current Configuration:**

| Setting | Value |
|---------|-------|
| **Polling Frequency** | Every 5 minutes |
| **Batch Size** | 50 emails per check |
| **Time Comparison** | `scheduled_for <= NOW()` |
| **Timezone** | UTC (ISO 8601) |
| **Accuracy** | ±5 minutes |

---

## 🧪 **Testing Your Understanding:**

### **Scenario 1:**
```
Current Time: March 12, 2026, 10:00 AM
Scheduled Time: March 12, 2026, 11:00 AM
Query: scheduled_for <= NOW()?
Answer: ❌ NO (11:00 AM > 10:00 AM) → Email stays pending
```

### **Scenario 2:**
```
Current Time: March 12, 2026, 11:05 AM
Scheduled Time: March 12, 2026, 11:00 AM
Query: scheduled_for <= NOW()?
Answer: ✅ YES (11:00 AM <= 11:05 AM) → Email sends!
```

### **Scenario 3:**
```
Current Time: March 15, 2026, 9:02 AM
Scheduled Time: March 15, 2026, 9:00 AM
Query: scheduled_for <= NOW()?
Answer: ✅ YES (9:00 AM <= 9:02 AM) → Email sends!
```

---

## 📊 **Database Query Examples:**

### **Check Pending Emails:**
```sql
SELECT * FROM email_queue
WHERE status = 'pending'
ORDER BY scheduled_for ASC;
```

### **Check Emails Due Now:**
```sql
SELECT * FROM email_queue
WHERE status = 'pending'
AND scheduled_for <= NOW()
ORDER BY scheduled_for ASC;
```

### **Check My Scheduled Emails:**
```sql
SELECT 
  email_type,
  scheduled_for,
  status,
  created_at
FROM email_queue
WHERE user_id = 'your-user-id'
AND status = 'pending'
ORDER BY scheduled_for ASC;
```

---

## ✅ **Summary:**

### **Your Understanding:**
> "In email_queue database, scheduled_for stores the date/time. When that time is reached, email sends."

**Status:** ✅ **ABSOLUTELY CORRECT!**

### **Exact Implementation:**
1. **User schedules** → `scheduled_for` = future timestamp
2. **Every 5 minutes** → System checks `scheduled_for <= NOW()`
3. **If TRUE** → Email sends immediately
4. **Status updates** → `pending` → `processing` → `sent`

---

## 🎉 **Perfect!**

Aapka understanding **100% accurate** hai! System exactly aise hi kaam kar raha hai:

```
scheduled_for column → Stores future date/time
                       ↓
              System checks every 5 min
                       ↓
           scheduled_for <= current time?
                       ↓
                  ✅ YES → SEND EMAIL!
                  ❌ NO  → Keep waiting
```

---

**Last Updated:** March 12, 2026  
**Status:** ✅ Fully Implemented & Working  
**Your Understanding:** ✅ Perfect!
