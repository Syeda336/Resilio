# 🕐 External Cron Job Setup Guide

## Issue: "401 Unauthorized" when testing external cron job

---

## ✅ **Solution: Add CRON_API_KEY**

External cron services (like cron-job.org, EasyCron, etc.) need authentication.

---

## 📝 **Step-by-Step Setup:**

### **Step 1: Get Your CRON_API_KEY**

1. Go to **Supabase Dashboard**
2. Select your project
3. Click **Edge Functions** in sidebar
4. Click **make-server-40d4d8fd**
5. Click **Settings** tab
6. Scroll to **Secrets** section
7. Look for **CRON_API_KEY**
8. Copy the value (it should look like a long random string)

**If CRON_API_KEY doesn't exist:**
- Click **Add new secret**
- Name: `CRON_API_KEY`
- Value: Generate a secure random string (e.g., `resilio-cron-2026-xyz123abc`)
- Click **Save**

---

### **Step 2: Configure Your Cron Job**

#### **Method A: Using Query Parameter (Easiest)**

**Cron Job URL:**
```
https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY_HERE
```

**Example:**
```
https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=resilio-cron-2026-xyz123abc
```

**Settings:**
- Method: `GET`
- Schedule: Every 5 minutes (*/5 * * * *)
- No additional headers needed

---

#### **Method B: Using Header (More Secure)**

**Cron Job URL:**
```
https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

**Custom Headers:**
```
X-Cron-API-Key: YOUR_CRON_API_KEY_HERE
```

**Example Header:**
```
X-Cron-API-Key: resilio-cron-2026-xyz123abc
```

**Settings:**
- Method: `GET`
- Schedule: Every 5 minutes (*/5 * * * *)
- Add header: `X-Cron-API-Key` with your key value

---

### **Step 3: Test Your Cron Job**

After adding the API key, click **Test Run** or **Run Now**

**Expected Response (Success):**
```json
{
  "success": true,
  "results": {
    "queueProcessed": 0,
    "queueSent": 0,
    "queueFailed": 0,
    "retriedEmails": 0,
    "message": "No pending emails"
  },
  "timestamp": "2026-03-15T14:30:00.000Z"
}
```

**Expected Response (If emails due):**
```json
{
  "success": true,
  "results": {
    "queueProcessed": 2,
    "queueSent": 2,
    "queueFailed": 0,
    "retriedEmails": 0,
    "message": "Processed 2 emails"
  },
  "timestamp": "2026-03-15T14:30:00.000Z"
}
```

---

## 🎯 **Different Cron Services:**

### **cron-job.org**

1. Create new cronjob
2. **URL:** `https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY`
3. **Schedule:** `*/5 * * * *` (every 5 minutes)
4. **Request method:** GET
5. Save

### **EasyCron**

1. Add new cron job
2. **URL:** `https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY`
3. **Cron Expression:** `*/5 * * * *`
4. **HTTP Method:** GET
5. Save

### **UptimeRobot (Alternative)**

1. Add new monitor
2. **Monitor Type:** HTTP(S)
3. **URL:** `https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY`
4. **Monitoring Interval:** 5 minutes
5. Save

---

## 🔐 **Security Notes:**

### **✅ Good Practices:**

1. **Generate Strong Key:**
   ```bash
   # Example strong keys:
   resilio-prod-cron-2026-a8f9d2c1
   resilio-email-scheduler-xyz789abc123
   ```

2. **Keep Key Secret:**
   - Don't commit to Git
   - Don't share publicly
   - Store in password manager

3. **Use Header Method:**
   - More secure than query parameter
   - Key not visible in logs
   - Recommended for production

### **❌ Avoid:**

- Using simple keys like "123456" or "password"
- Sharing the same key across multiple services
- Exposing key in public URLs

---

## 🧪 **Testing Your Setup:**

### **Test 1: Check Authentication**

**Without API Key (Should Fail):**
```bash
curl https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Unauthorized. Please login or provide valid CRON_API_KEY."
}
```

**With API Key (Should Succeed):**
```bash
curl "https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "results": {...}
}
```

---

### **Test 2: Verify Logging**

1. Go to **Supabase Dashboard**
2. **Edge Functions** → **make-server-40d4d8fd** → **Logs**
3. Trigger your cron job
4. Look for:
   ```
   🔐 Auth Check - Received headers:
      X-Cron-API-Key: "YOUR_KEY" (or from query)
   ✅ External cron authenticated
   🔄 Processing pending emails...
   ```

---

## 🆘 **Troubleshooting:**

### **Error: "401 Unauthorized"**

**Possible Causes:**
1. ❌ CRON_API_KEY not set in Supabase secrets
2. ❌ Wrong API key in cron job
3. ❌ Typo in URL or header name

**Solutions:**
- ✅ Verify CRON_API_KEY exists in Supabase Edge Function secrets
- ✅ Copy-paste the exact key (no spaces)
- ✅ Use query parameter: `?api_key=YOUR_KEY`
- ✅ Check Supabase logs for exact error

---

### **Error: "SMTP_PASSWORD not configured"**

**Solution:**
Make sure SMTP credentials are set in Edge Function secrets:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

---

### **No Emails Sending**

**Check:**
1. Are there pending emails in database?
   ```sql
   SELECT * FROM email_queue WHERE status = 'pending';
   ```

2. Is scheduled time reached?
   ```sql
   SELECT 
     scheduled_for,
     NOW() as current_time,
     (scheduled_for <= NOW()) as is_due
   FROM email_queue 
   WHERE status = 'pending';
   ```

3. Check Supabase function logs for errors

---

## 📊 **Monitoring Your Cron Job:**

### **Check Status Endpoint (No Auth Required):**

```bash
curl https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status
```

**Response:**
```json
{
  "success": true,
  "currentTime": "2026-03-15T14:30:00.000Z",
  "summary": {
    "total": 5,
    "pending": 2,
    "dueNow": 1,
    "upcoming": 1,
    "sent": 2,
    "failed": 0
  },
  "dueNow": [
    {
      "id": "abc-123",
      "email": "user@example.com",
      "type": "future_message",
      "scheduledFor": "2026-03-15T14:25:00.000Z"
    }
  ]
}
```

---

## 🎯 **Recommended Cron Schedule:**

### **Every 5 Minutes (Default):**
```
*/5 * * * *
```
**Good for:** Real-time-ish delivery (emails arrive within 5 minutes of scheduled time)

### **Every 1 Minute (Aggressive):**
```
* * * * *
```
**Good for:** Near-instant delivery
**Warning:** More API calls, may hit rate limits on free tier

### **Every 15 Minutes (Conservative):**
```
*/15 * * * *
```
**Good for:** Reducing API usage
**Warning:** Emails may be delayed up to 15 minutes

---

## 🔄 **Frontend Polling vs External Cron:**

### **Frontend Polling (Current Setup):**
- ✅ No external service needed
- ✅ Works automatically when user is logged in
- ❌ Stops when user closes browser
- ❌ Only works when someone is online

### **External Cron Job (Recommended):**
- ✅ Always running, 24/7
- ✅ Works even when no users online
- ✅ Reliable scheduled delivery
- ❌ Requires setup
- ❌ May cost money (free tiers available)

### **Best Practice: Use Both!**
- Frontend polling: Quick delivery when users online
- External cron: Backup for when no one online

---

## ✅ **Complete Setup Checklist:**

- [ ] CRON_API_KEY set in Supabase Edge Function secrets
- [ ] SMTP credentials set in Edge Function secrets
- [ ] External cron job created with API key
- [ ] Cron schedule set to */5 * * * * (every 5 minutes)
- [ ] Test run successful (200 OK response)
- [ ] Supabase logs showing "✅ External cron authenticated"
- [ ] Email queue status endpoint accessible
- [ ] Test email scheduled and received

---

## 🎉 **Quick Start (TL;DR):**

1. **Get your CRON_API_KEY** from Supabase Edge Function secrets
2. **Create cron job** at cron-job.org (or similar)
3. **URL:** `https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY_HERE`
4. **Schedule:** Every 5 minutes
5. **Test!**

---

**Need Help?**

Check Supabase logs:
```
Dashboard → Edge Functions → make-server-40d4d8fd → Logs
```

Look for:
- 🔐 Auth Check messages
- ✅ External cron authenticated
- 🔄 Processing pending emails
- ❌ Any error messages

---

**Last Updated:** March 12, 2026  
**Status:** External cron requires CRON_API_KEY  
**Action:** Add API key to your cron job URL or headers
