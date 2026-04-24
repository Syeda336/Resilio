# 🔍 Email Scheduling Debug Guide

## Issue: Emails not sending at scheduled time

### **Quick Debugging Steps:**

---

## **Step 1: Check Queue Status**

Open browser console (F12) and run:

```javascript
// Check email queue status
fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status')
  .then(r => r.json())
  .then(data => {
    console.log('📊 Queue Status:', data);
    console.log('\n⏰ Current Time:', data.currentTime);
    console.log('\n📧 Summary:');
    console.log('  - Total:', data.summary.total);
    console.log('  - Pending:', data.summary.pending);
    console.log('  - Due Now:', data.summary.dueNow);
    console.log('  - Upcoming:', data.summary.upcoming);
    console.log('  - Sent:', data.summary.sent);
    console.log('  - Failed:', data.summary.failed);
    
    if (data.dueNow && data.dueNow.length > 0) {
      console.log('\n⚠️ EMAILS DUE NOW:');
      data.dueNow.forEach(e => {
        console.log(`  - ${e.type} to ${e.email} (scheduled: ${e.scheduledFor})`);
      });
    }
    
    if (data.upcoming && data.upcoming.length > 0) {
      console.log('\n📅 UPCOMING EMAILS:');
      data.upcoming.forEach(e => {
        const scheduled = new Date(e.scheduledFor);
        const now = new Date(data.currentTime);
        const diffMin = Math.round((scheduled - now) / 60000);
        console.log(`  - ${e.type} in ${diffMin} minutes (${e.scheduledFor})`);
      });
    }
  });
```

---

## **Step 2: Manually Trigger Email Processing**

```javascript
// Get your access token
const token = localStorage.getItem('resilio_access_token');

// Manually trigger email check
fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Cron-API-Key': 'resilio-internal-trigger'
  }
})
.then(r => r.json())
.then(data => {
  console.log('📧 Processing Result:', data);
  console.log('\n✅ Results:');
  console.log('  - Processed:', data.results?.queueProcessed || 0);
  console.log('  - Sent:', data.results?.queueSent || 0);
  console.log('  - Failed:', data.results?.queueFailed || 0);
});
```

---

## **Step 3: Check Supabase Logs**

1. Go to **Supabase Dashboard** → Your Project
2. Click **Edge Functions** in sidebar
3. Click **make-server-40d4d8fd**
4. Click **Logs** tab
5. Look for:
   - `🔄 Processing pending emails...`
   - `⏰ Current time: ...`
   - `📧 Found X pending emails to process`
   - `✅ Email sent successfully`
   - `❌ Failed to send email`

---

## **Step 4: Check Database Directly**

### **Via Supabase Dashboard:**

1. Go to **Supabase Dashboard** → Your Project
2. Click **Table Editor** in sidebar
3. Click **email_queue** table
4. Look at rows with `status = 'pending'`
5. Compare `scheduled_for` column with current time

### **Via SQL Editor:**

```sql
-- Check all pending emails
SELECT 
  id,
  email_type,
  user_email,
  scheduled_for,
  NOW() as current_time,
  (scheduled_for <= NOW()) as is_due,
  EXTRACT(EPOCH FROM (scheduled_for - NOW()))/60 as minutes_until_due,
  status,
  created_at
FROM email_queue
WHERE status = 'pending'
ORDER BY scheduled_for ASC;
```

---

## **Common Issues & Solutions:**

### **Issue 1: Emails showing as "pending" but not sending**

**Check:**
```javascript
// See if they're actually due
fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status')
  .then(r => r.json())
  .then(data => {
    console.log('Due now?', data.summary.dueNow);
    console.log('Current time:', data.currentTime);
    if (data.upcoming.length > 0) {
      const nextEmail = data.upcoming[0];
      const scheduledTime = new Date(nextEmail.scheduledFor);
      const currentTime = new Date(data.currentTime);
      console.log('Next email in:', Math.round((scheduledTime - currentTime) / 60000), 'minutes');
    }
  });
```

**Possible Causes:**
- ✅ Timezone mismatch (date stored as local, compared as UTC)
- ✅ Polling not running (user not logged in)
- ✅ SMTP not configured

**Solution:**
- Trigger manually (Step 2 above)
- Check Supabase logs for errors

---

### **Issue 2: Timezone Problems**

**Symptoms:**
- Email scheduled for 9:00 AM
- Database shows different time
- Email sends at wrong time

**Debug:**
```javascript
// Check what time is being stored
const testDate = '2026-03-15';
const testTime = '09:00:00';
const combined = new Date(`${testDate}T${testTime}`);
console.log('Local time:', combined.toString());
console.log('ISO (UTC):', combined.toISOString());

// Compare with system time
console.log('Current local:', new Date().toString());
console.log('Current UTC:', new Date().toISOString());
```

**Solution:**
- Date format updated to use `YYYY-MM-DDTHH:MM:SS` (ISO 8601)
- Always stored as UTC in database
- Comparison done in UTC

---

### **Issue 3: Polling Not Working**

**Symptoms:**
- No console logs showing "📧 Checking for scheduled emails..."
- Emails never send even when due

**Debug:**
```javascript
// Check if App.tsx polling is active
console.log('Polling active?', !!localStorage.getItem('resilio_access_token'));

// Look for console logs every 5 minutes
// Should see: "📧 Checking for scheduled emails..."
```

**Solution:**
- Make sure you're logged in
- Refresh the page
- Check browser console for errors

---

### **Issue 4: SMTP Not Configured**

**Symptoms:**
- Logs show "SMTP_PASSWORD not configured"
- Emails marked as "failed"

**Debug:**
```javascript
fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/health')
  .then(r => r.json())
  .then(data => console.log('SMTP configured?', data.environment.SMTP_PASSWORD_SET));
```

**Solution:**
- Check Supabase Edge Function secrets
- Ensure SMTP_PASSWORD is set

---

## **Complete Test Procedure:**

### **Create Test Email (5 minutes from now):**

1. **Login to Resilio**
2. **Go to Future Self Messages**
3. **Create new message:**
   - Message: "Test email"
   - Date: Today
   - Time: 5 minutes from now
   - Example: If it's 2:00 PM now, set time to 2:05 PM
4. **Save**
5. **Should see alert:** "Email will be sent on [date/time]"

### **Monitor:**

```javascript
// Run this every minute
const checkStatus = () => {
  fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status')
    .then(r => r.json())
    .then(data => {
      const now = new Date(data.currentTime);
      console.log(`\n⏰ ${now.toLocaleTimeString()}`);
      console.log(`📧 Due now: ${data.summary.dueNow}`);
      console.log(`📅 Upcoming: ${data.summary.upcoming}`);
      console.log(`✅ Sent: ${data.summary.sent}`);
      
      if (data.dueNow && data.dueNow.length > 0) {
        console.log('⚠️ EMAILS DUE - Should send soon!');
      }
    });
};

// Check every minute
const interval = setInterval(checkStatus, 60000);
checkStatus(); // Check immediately

// Stop monitoring after 10 minutes
setTimeout(() => {
  clearInterval(interval);
  console.log('Monitoring stopped');
}, 10 * 60000);
```

### **Expected Timeline:**

```
2:00 PM - Email created (scheduled for 2:05 PM)
          Database: scheduled_for = "2026-03-15T14:05:00.000Z"
          Status: pending

2:02 PM - Polling check
          Query: SELECT WHERE scheduled_for <= "2026-03-15T14:02:00.000Z"
          Result: No match (14:05 > 14:02)
          
2:05 PM - Polling check
          Query: SELECT WHERE scheduled_for <= "2026-03-15T14:05:30.000Z"
          Result: ✅ MATCH! (14:05 <= 14:05:30)
          Action: Send email
          
2:05 PM - Email sent! 📧
          Status: sent
          Check inbox!
```

---

## **Advanced Debugging:**

### **Check Raw Database Time:**

```sql
SELECT 
  email_type,
  scheduled_for,
  scheduled_for AT TIME ZONE 'UTC' as utc_time,
  scheduled_for AT TIME ZONE 'America/New_York' as local_time,
  NOW() as current_utc,
  (scheduled_for <= NOW()) as should_send
FROM email_queue
WHERE status = 'pending'
ORDER BY scheduled_for;
```

### **Force Send Now:**

If you want to test immediately without waiting:

1. **Go to Supabase Dashboard**
2. **Table Editor** → **email_queue**
3. **Find your pending email**
4. **Edit** `scheduled_for` column
5. **Set to:** Current time minus 1 minute
6. **Save**
7. **Trigger check manually** (Step 2 above)
8. **Email should send immediately!**

---

## **Expected Console Logs:**

### **When No Emails Due:**
```
📧 Checking for scheduled emails...
[Backend] 🔄 Processing pending emails...
[Backend]    ⏰ Current time: 2026-03-15T14:02:00.000Z
[Backend] ✅ No pending emails to process
[Backend]    ℹ️ 1 pending emails exist but not due yet:
[Backend]       - future_message scheduled for 2026-03-15T14:05:00.000Z (3 minutes from now)
```

### **When Emails Due:**
```
📧 Checking for scheduled emails...
[Backend] 🔄 Processing pending emails...
[Backend]    ⏰ Current time: 2026-03-15T14:05:30.000Z
[Backend] 📧 Found 1 pending emails to process
[Backend]    - future_message to user@example.com (scheduled: 2026-03-15T14:05:00.000Z)
[Backend] 📤 Processing email abc-123...
[Backend] ✅ Email sent successfully: abc-123
[Backend] ✅ Processing complete: 1 sent, 0 failed
✅ Email queue processed: 1 sent, 0 failed
```

---

## **Quick Fixes:**

### **Fix 1: Force Immediate Check**
```javascript
const token = localStorage.getItem('resilio_access_token');
fetch('https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Cron-API-Key': 'resilio-internal-trigger'
  }
}).then(r => r.json()).then(console.log);
```

### **Fix 2: Check Specific Email**
```sql
-- Replace 'abc-123' with your email ID
SELECT * FROM email_queue WHERE id = 'abc-123';
```

### **Fix 3: Retry Failed Emails**
They automatically retry on next check (up to 3 times)

---

## **Contact Points:**

If emails still not sending after debugging:

1. **Check Supabase Function Logs** (most important!)
2. **Check email_queue table** in Supabase
3. **Verify SMTP credentials** in Edge Function secrets
4. **Test SMTP connection** separately

---

**Last Updated:** March 12, 2026  
**Status:** Enhanced logging added ✅  
**Next Steps:** Run Step 1 and Step 2 above
