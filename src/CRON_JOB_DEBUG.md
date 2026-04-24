# 🔍 Debugging Cron Job "Failed (HTTP error)"

## 🐛 The Problem

Your cron job is showing:
```
❌ Failed (HTTP error)
```

This means the cron job cannot successfully call the scheduler endpoint.

---

## 📊 Diagnosis

### Check #1: Is the Endpoint URL Correct?

Your cron job should be calling:
```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

**Verify:**
1. Go to cron-job.org (or your cron service)
2. Check the URL is exactly as above
3. Make sure it's a **GET** request (not POST)

---

### Check #2: Test the Endpoint Manually

Open this URL in your browser:
```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

**Expected response:**
```json
{
  "success": true,
  "results": {
    "remindersSent": 0,
    "messagesSent": 1,
    "errors": []
  },
  "timestamp": "2025-11-28T09:40:00.000Z"
}
```

**If you get an error**, copy the full error message.

---

### Check #3: Check Supabase Edge Function Logs

1. Go to Supabase Dashboard
2. Click **Edge Functions** (left sidebar)
3. Click **Logs**
4. Look for errors when the cron job runs

Common errors:
- `SMTP_HOST is not defined` → SMTP secrets not set
- `Connection refused` → SMTP credentials wrong
- `Authentication failed` → Gmail app password incorrect

---

## 🔧 Likely Causes

### Cause 1: SMTP Secrets Not Set ⭐ MOST LIKELY

The endpoint tries to send emails but SMTP credentials are missing.

**Solution:**
1. Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/settings/functions
2. Add these 5 secrets:

| Secret Name | Your Value |
|-------------|------------|
| SMTP_HOST | `smtp.gmail.com` |
| SMTP_PORT | `587` |
| SMTP_USER | `your-gmail@gmail.com` |
| SMTP_PASSWORD | `lidwvvvgopxcygbz` (no spaces!) |
| SMTP_FROM | `your-gmail@gmail.com` |

**IMPORTANT:** 
- Remove spaces from password: `lidwvvvgopxcygbz`
- Use YOUR actual Gmail address

---

### Cause 2: Wrong Cron URL

**Check your cron-job.org settings:**

```
✅ Correct URL:
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails

❌ Wrong URLs:
https://wuzbuxeqqubolujjtizc.supabase.co/make-server-40d4d8fd/cron/check-scheduled-emails
(missing /functions/v1)

https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/cron/check-scheduled-emails
(missing make-server-40d4d8fd)
```

---

### Cause 3: Edge Function Not Deployed

The server code might not be deployed to Supabase.

**Solution:**
1. In Supabase Dashboard, go to **Edge Functions**
2. Check if you see a function deployed
3. If not, the server needs to be deployed

---

### Cause 4: SMTP Connection Failed

Gmail might be blocking the connection.

**Check:**
1. Gmail App Password is correct: `lidwvvvgopxcygbz`
2. 2-Factor Authentication is enabled on your Google account
3. App Password was generated for "Mail" or "Other"

**Test SMTP separately:**
Open: `/test-email-system.html`

---

## ✅ Step-by-Step Fix

### Step 1: Add SMTP Secrets

1. **Go to Supabase Edge Functions Settings:**
   ```
   https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/settings/functions
   ```

2. **Add these 5 secrets:**
   - SMTP_HOST: `smtp.gmail.com`
   - SMTP_PORT: `587`
   - SMTP_USER: `youremail@gmail.com` ← YOUR Gmail
   - SMTP_PASSWORD: `lidwvvvgopxcygbz` ← NO SPACES
   - SMTP_FROM: `youremail@gmail.com` ← YOUR Gmail

3. **Click Save** for each one

---

### Step 2: Test Endpoint Manually

**In your browser, open:**
```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

**What you should see:**
- ✅ JSON response with success: true
- ✅ messagesSent: 1
- ✅ No errors array

**If you get an error:**
- Copy the full error message
- Check Supabase Edge Function logs

---

### Step 3: Fix Cron Job URL

1. Go to cron-job.org
2. Edit your cron job
3. **Set URL to:**
   ```
   https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
   ```
4. **Set Method:** GET
5. **Schedule:** Every 5 minutes (for testing)
6. Save

---

### Step 4: Monitor Logs

**In Supabase Dashboard:**
1. Go to **Edge Functions** → **Logs**
2. Watch for the cron job to run
3. Look for:
   - ✅ `Checking for scheduled emails to send...`
   - ✅ `Future message is due`
   - ✅ `Future message email sent to user@email.com`

**If you see errors:**
- SMTP errors → Check credentials
- "No email found" → User data issue
- Connection timeout → Network issue

---

## 🧪 Quick Test

### Test 1: Browser Test

1. Open in browser:
   ```
   https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
   ```

2. Expected result:
   ```json
   {"success":true,"results":{"remindersSent":0,"messagesSent":1,"errors":[]},"timestamp":"2025-11-28T..."}
   ```

### Test 2: Check Your Email

After the endpoint returns success, check your email inbox for:
- Subject: "📬 Message from Your Past Self"
- From: your-gmail@gmail.com
- Contains: "Checking" (your message)

**Check spam folder too!**

---

## 📋 Checklist

Before asking for more help, verify:

- [ ] SMTP secrets are added to Supabase Edge Functions
- [ ] SMTP_PASSWORD has NO SPACES: `lidwvvvgopxcygbz`
- [ ] SMTP_USER and SMTP_FROM are YOUR Gmail address
- [ ] Cron job URL is exactly: `https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails`
- [ ] Cron job method is GET
- [ ] Manual browser test returns `{"success":true,...}`
- [ ] Supabase Edge Function logs show no errors

---

## 🎯 Most Likely Solution

**90% chance the issue is:**

1. **SMTP secrets not set in Supabase**
2. **OR password has spaces** (should be `lidwvvvgopxcygbz`)

**Fix:**
1. Go to Supabase Edge Functions settings
2. Add all 5 SMTP secrets
3. Make sure password is `lidwvvvgopxcygbz` (no spaces)
4. Test the endpoint in browser
5. Should work! ✅

---

## 📞 Still Not Working?

If you've checked everything above, provide:

1. **Browser test result** (copy JSON response)
2. **Supabase Edge Function logs** (screenshot)
3. **Cron job settings** (screenshot)
4. **SMTP secrets list** (just the names, not values)

This will help diagnose the exact issue!

---

**Let's get your emails working! 🚀**
