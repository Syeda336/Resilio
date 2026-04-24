# 🔧 Email Not Working - Complete Fix Guide

## ❌ Problem: "I am not receiving emails"

Follow these steps **IN ORDER** to fix the email issue:

---

## 📋 Step 1: Check SMTP Configuration

### Go to Supabase Dashboard:
1. Open https://supabase.com/dashboard
2. Select your project: **jcbtczjhqdyuoyctjcbl**
3. Click **Edge Functions** (left sidebar)
4. Click **server** function
5. Go to **Settings** tab
6. Scroll to **Secrets** section

### Check if these 5 secrets exist:

| Secret Name | Expected Value |
|-------------|----------------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASSWORD` | 16-character Gmail App Password |
| `SMTP_FROM` | Your Gmail address (same as SMTP_USER) |

### ⚠️ If ANY secret is missing:

**You MUST add them!** Emails will NOT work without these.

---

## 📧 Step 2: Get Gmail App Password

**IMPORTANT:** You CANNOT use your regular Gmail password. You need an "App Password".

### How to Create Gmail App Password:

1. Go to: https://myaccount.google.com/apppasswords
2. Login with your Gmail account
3. Click **"Select app"** → Choose **"Mail"**
4. Click **"Select device"** → Choose **"Other"** → Type **"Resilio"**
5. Click **"Generate"**
6. Copy the **16-character password** (looks like: `abcd efgh ijkl mnop`)
7. **Remove spaces**: `abcdefghijklmnop`

### Add to Supabase:
- Go back to Supabase Edge Functions → Settings → Secrets
- Add new secret: `SMTP_PASSWORD` = `abcdefghijklmnop` (no spaces!)
- Click **Save**

---

## 🧪 Step 3: Test Email System

### Open the test page:
Open this file in your browser: `/test-diet-email-direct.html`

### Run the test:
1. **Login** with your Resilio account
2. **Check Server Health** (Step 3)
   - Should show: ✅ SMTP_PASSWORD: SET
   - If it shows ❌ NOT SET, go back to Step 1
3. **Send Test Email** (Step 2)
   - Fill in all fields
   - Set time to **current time or past time** for immediate send
   - Click **"Send Test Email Now"**
4. **Check your inbox**
   - Email should arrive within 30 seconds
   - Check spam folder too

---

## 🔍 Step 4: Debug with Console Logs

### In the app:
1. Open Chrome DevTools (F12)
2. Go to **Console** tab
3. Go to Food Database or Meal Planner
4. Add an item
5. Look for these logs:

**✅ Success logs should show:**
```
📧 Sending meal email automatically...
📦 Email payload: {...}
📨 Email Response: 200 true
✅ Email queued successfully
```

**❌ If you see errors:**
```
❌ Failed to send email: SMTP not configured
⚠️ Failed to send immediate email
```
→ Go back to Step 1 and add SMTP secrets

---

## 🎯 Step 5: Check Email Queue

### Using the test page:
1. Open `/test-diet-email-direct.html`
2. Click **"View Email Queue Status"** (Step 4)
3. Check the results:
   - **Due Now**: Emails that should send immediately
   - **Upcoming**: Emails scheduled for later
   - **Sent**: Successfully delivered emails
   - **Failed**: Failed deliveries

### If emails are stuck in "Pending":
- They will be processed by the cron job (runs every 5 minutes)
- OR they're scheduled for a future time
- Check the scheduled time in the queue

---

## ⚙️ Step 6: Verify Immediate Send Logic

### The system now sends emails immediately if:
1. Scheduled time is **now** or in the **past**
2. Scheduled time is within **next 5 minutes**

### Example:
- Current time: 2:00 PM
- You schedule for: 2:00 PM → ✅ Sends immediately
- You schedule for: 2:03 PM → ✅ Sends immediately (within 5 min)
- You schedule for: 6:00 PM → 📅 Queued for 6:00 PM

---

## 🚨 Common Issues & Solutions

### Issue 1: "SMTP_PASSWORD not configured"
**Solution:** Add SMTP secrets in Supabase (Step 1 & 2)

### Issue 2: "Email sent but not received"
**Possible causes:**
1. **Spam folder** - Check spam/junk folder
2. **Wrong email** - Verify you're using correct email address
3. **Gmail blocking** - Check Gmail's security settings
4. **Wrong App Password** - Regenerate app password (Step 2)

### Issue 3: "401 Unauthorized"
**Solution:** Login again to get fresh access token

### Issue 4: "Email queued but not arriving"
**Possible causes:**
1. **Future scheduled time** - Email will arrive at that time
2. **Cron not running** - Wait 5 minutes for next cron cycle
3. **Email in failed status** - Check queue status (Step 5)

### Issue 5: Email arrives with wrong time
**Solution:** Already fixed! Server now uses local timezone, not UTC.

---

## ✅ Checklist Before Asking for Help

- [ ] All 5 SMTP secrets added to Supabase
- [ ] SMTP_PASSWORD is 16-character Gmail App Password (no spaces)
- [ ] Server health check shows ✅ SMTP_PASSWORD: SET
- [ ] Test email sent from `/test-diet-email-direct.html`
- [ ] Checked spam folder
- [ ] Checked browser console for errors
- [ ] Checked email queue status
- [ ] Waited at least 5 minutes for queued emails

---

## 📞 Still Not Working?

If you've completed ALL steps above and still not receiving emails:

1. **Share this information:**
   - Screenshot of Supabase Secrets page (hide the actual password values)
   - Screenshot of Server Health Check result
   - Screenshot of Email Queue Status
   - Console logs from browser DevTools
   - Your Gmail address (to verify it's correct)

2. **Check Supabase Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → server
   - Click **Logs** tab
   - Look for recent errors
   - Share the error messages

---

## 🎉 Success Indicators

You'll know emails are working when:
1. ✅ Server health check shows SMTP configured
2. ✅ Test email arrives in inbox
3. ✅ Console shows "Email sent immediately" or "Email queued successfully"
4. ✅ Real emails from Food Database/Meal Planner arrive
5. ✅ No errors in browser console or Supabase logs

---

**Last Updated:** April 1, 2026
