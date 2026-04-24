# ⚡ Quick Test Guide - Email Queue System

Emails **scheduled date aur time par automatically send honge!** Yeh guide aapko **step-by-step testing** karwayegi.

---

## 🚀 Step-by-Step Testing

### **Step 1: Database Setup** (Ek baar karna hai)

1. **Supabase Dashboard** open karen
2. **SQL Editor** → **New Query** click karen
3. Yeh SQL paste karen:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON email_queue(user_id);
```

4. **Run** button click karen
5. **Success** message dekhen!

---

### **Step 2: Check Queue Status**

Browser mein yeh URL open karen (koi auth nahi chahiye):

```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status
```

**Expected Response:**
```json
{
  "success": true,
  "currentTime": "2026-03-11T10:30:00.000Z",
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

✅ **Agar yeh response aaya** = Database ready hai!

---

### **Step 3: Create a Test Future Message**

Apni Resilio app mein:

1. **Future Self Messaging** section open karen
2. Ek message likhen: `"Testing automated email delivery!"`
3. **Scheduled Date**: Today ka date select karen
4. **Scheduled Time**: **Current time se 2 minutes aage** (example: agar abhi 10:30 hai, toh 10:32 select karen)
5. **"Schedule Message"** button click karen

**Console logs dekhen:**
```
✅ Future message scheduled for delivery: 2026-03-11T10:32:00.000Z
```

---

### **Step 4: Verify Email is Queued**

Queue status wala URL refresh karen:

```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status
```

**Ab aapko yeh dikhna chahiye:**
```json
{
  "success": true,
  "summary": {
    "total": 1,
    "pending": 1,
    "upcoming": 1
  },
  "upcoming": [
    {
      "id": "...",
      "email": "your@email.com",
      "type": "future_message",
      "scheduledFor": "2026-03-11T10:32:00.000Z",
      "subject": "📬 Message from Your Past Self"
    }
  ]
}
```

✅ **Email queue mein aa gaya!**

---

### **Step 5: Setup Cron Job**

**Option A: Manual Testing (Abhi ke liye)**

Scheduled time aane par, manually process karen:

```bash
curl -X POST \
  "https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/process?api_key=YOUR_CRON_API_KEY"
```

**Option B: Automatic (Production ke liye)**

1. https://cron-job.org par jaayein
2. Sign up / Login karein
3. "Create cronjob" click karein:
   - **Title:** Resilio Email Queue
   - **URL:** `https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/process?api_key=YOUR_CRON_API_KEY`
   - **Schedule:** `* * * * *` (every minute)
   - **Request Method:** POST

---

### **Step 6: Wait for Scheduled Time**

Jab scheduled time aa jaye:

**Method 1: Automatic (Agar cron setup hai)**
- Bas wait karen
- Email automatically aayega!

**Method 2: Manual Trigger**

```bash
curl -X POST \
  "https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/process?api_key=YOUR_CRON_API_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "processed": 1,
  "sent": 1,
  "failed": 0,
  "message": "Processed 1 emails: 1 sent, 0 failed"
}
```

---

### **Step 7: Verify Email Was Sent**

Queue status check karen:

```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status
```

**Ab aapko yeh dikhna chahiye:**
```json
{
  "summary": {
    "total": 1,
    "pending": 0,
    "sent": 1
  },
  "recentlySent": [
    {
      "id": "...",
      "email": "your@email.com",
      "type": "future_message",
      "scheduledFor": "2026-03-11T10:32:00.000Z",
      "sentAt": "2026-03-11T10:32:15.000Z"
    }
  ]
}
```

✅ **Email sent!** Check your inbox!

---

## 📧 Testing Personal Reminders

Same process:

1. **Personal Reminders** section mein jaayein
2. Task likhen: `"Test reminder email"`
3. **Date**: Today
4. **Time**: Current time + 2 minutes
5. **Save** click karen

Process same hai - wait for scheduled time, then check inbox!

---

## 🔍 Monitoring Commands

### Check All Pending Emails
```sql
SELECT * FROM email_queue WHERE status = 'pending';
```

### Check Sent Emails
```sql
SELECT * FROM email_queue WHERE status = 'sent' ORDER BY sent_at DESC;
```

### Check Failed Emails
```sql
SELECT * FROM email_queue WHERE status = 'failed';
```

### Count by Status
```sql
SELECT status, COUNT(*) FROM email_queue GROUP BY status;
```

---

## ✅ Success Checklist

- [ ] Database table create ho gaya
- [ ] Queue status endpoint working hai
- [ ] Test message create kiya
- [ ] Email queue mein dikhaya
- [ ] Scheduled time par process hua
- [ ] Email inbox mein aaya

---

## 🚨 Troubleshooting

### Problem: Email queue mein nahi aa raha

**Check console logs:**
```
⚠️ Failed to queue email, but message was saved: [error]
```

**Solution:** Database table create karna bhul gaye - Step 1 repeat karen

---

### Problem: Email send nahi ho raha

**Check SMTP settings:**
```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/health
```

**Expected:**
```json
{
  "environment": {
    "SMTP_PASSWORD_SET": true,
    "SMTP_USER_SET": true
  }
}
```

---

### Problem: Cron job nahi chal raha

**Manual test karen:**
```bash
curl -X POST \
  "https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/process?api_key=YOUR_CRON_API_KEY"
```

**Agar "Unauthorized" aaya:**
- CRON_API_KEY check karen
- Supabase environment variables dekhen

---

## 💡 Pro Tips

1. **Test with short time:** Pehle 2-3 minutes future mein test karen
2. **Monitor logs:** Supabase Dashboard → Logs → Edge Functions
3. **Check queue:** `/email/queue/status` endpoint frequently check karen
4. **Database direct:** Table Editor mein `email_queue` table dekhen

---

## 📊 Example Timeline

```
10:30:00 - Message created → Email queued
10:30:00 - scheduled_for = 10:32:00
10:31:00 - Cron runs → "No emails due yet"
10:32:00 - Cron runs → "Processing 1 email"
10:32:05 - Email sent via SMTP
10:32:06 - Status updated to 'sent'
10:32:10 - Email arrives in inbox ✅
```

---

**Ready to test? Follow the steps aur batayein kya result aaya!** 🎯

---

## 🎯 Final Verification

Agar yeh sab kaam kar gaya:

✅ Future messages scheduled time par send honge  
✅ Reminders scheduled time par send honge  
✅ Failed emails automatically retry honge  
✅ Full monitoring aur visibility hai  
✅ Production-ready system hai!  

**Happy Testing! 🚀**
