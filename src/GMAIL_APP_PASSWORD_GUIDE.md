# 🔐 Gmail Authentication Error - App Password Required

## ❌ Current Error

```
Invalid login: 535-5.7.8 Username and Password not accepted
https://support.google.com/mail/?p=BadCredentials
```

---

## 🔍 What This Means

Gmail is **rejecting your SMTP login** because you're likely using:
- ❌ Your regular Gmail password
- ❌ A password without "Allow less secure app access"
- ❌ An account without 2-Step Verification enabled

**Gmail requires an "App Password" for SMTP access!**

---

## ✅ How to Fix (5 Minutes)

### Step 1: Enable 2-Step Verification

**You MUST have 2-Step Verification enabled to create App Passwords!**

1. Go to: https://myaccount.google.com/signinoptions/two-step-verification
2. Click **"Get Started"**
3. Follow the setup wizard (choose phone verification method)
4. Complete the setup

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → App passwords
2. Sign in if prompted
3. You'll see **"Select app"** dropdown
   - Choose: **"Mail"**
4. You'll see **"Select device"** dropdown
   - Choose: **"Other (Custom name)"**
   - Type: **"Resilio App"**
5. Click **"Generate"**
6. You'll see a **16-character password** like: `abcd efgh ijkl mnop`
7. **Copy this password** (you can't see it again!)

### Step 3: Update Supabase Secrets

1. Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/settings/functions
2. Find **"Secrets"** or **"Environment Variables"** section
3. Find the variable: **`SMTP_PASSWORD`**
4. Click **"Edit"**
5. **Paste the 16-character App Password** (without spaces!)
   - Example: `abcdefghijklmnop`
6. Click **"Save"**

### Step 4: Verify Other SMTP Settings

Make sure these are correct:

```bash
SMTP_HOST=smtp.gmail.com          # ← NOT smpt!
SMTP_PORT=587                     # ← OR 465 (try both if 587 fails)
SMTP_USER=your-email@gmail.com    # ← Your full Gmail address
SMTP_PASSWORD=your-app-password   # ← The 16-char password from Step 2
SMTP_FROM=your-email@gmail.com    # ← Same as SMTP_USER
```

### Step 5: Restart Edge Function (Optional)

1. Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/functions
2. Click on **`make-server-40d4d8fd`**
3. Click **"Restart"** button
4. Wait 30 seconds

---

## 🧪 Test If It's Fixed

### Test 1: Send a Future Message

1. Log in to your Resilio app
2. Go to **Journal → Future Self Messages**
3. Create a new future message (schedule it for tomorrow)
4. Open browser console (F12)
5. Look for: ✅ **"Email sent successfully"**
6. Check logs for: ❌ "Invalid login" (should be gone!)

### Test 2: Check Edge Function Logs

1. Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/functions
2. Click on **`make-server-40d4d8fd`**
3. Click **"Logs"** tab
4. Create a reminder in your app
5. Look for email success logs (not authentication errors)

---

## ⚠️ Troubleshooting

### Issue 1: "App passwords" option not showing

**Cause:** 2-Step Verification is not enabled
**Fix:** 
1. Go to: https://myaccount.google.com/signinoptions/two-step-verification
2. Enable 2-Step Verification first
3. Then try accessing App Passwords again

### Issue 2: Still getting "Invalid login" error

**Try these:**

1. **Double-check the App Password:**
   - Make sure you copied it correctly (no spaces)
   - It should be exactly 16 characters
   - Try generating a new one

2. **Try port 465 instead of 587:**
   ```bash
   SMTP_PORT=465
   ```

3. **Verify SMTP_USER format:**
   - Must be: `youremail@gmail.com` (full email)
   - NOT: `youremail` (without @gmail.com)

4. **Check if SMTP_FROM matches SMTP_USER:**
   ```bash
   SMTP_USER=your@gmail.com
   SMTP_FROM=your@gmail.com    # ← Must be the same!
   ```

### Issue 3: "Less secure app access" message

**Gmail no longer supports "Less secure apps"!**
- You MUST use App Passwords
- No other workaround exists
- If your account is managed by work/school, ask admin to enable App Passwords

### Issue 4: Account is a Workspace/Organization account

If your Gmail is part of Google Workspace (work/school):
- Ask your admin to enable "Less secure apps" or "App passwords"
- OR use a personal Gmail account instead
- OR use an alternative email provider (Outlook, Yahoo, etc.)

---

## 🎯 Summary: Gmail SMTP Setup

| Feature | Gmail SMTP |
|---------|------------|
| Setup Complexity | 🟡 Medium |
| App Password Required | ✅ Yes |
| 2-Step Verification | ✅ Required |
| Configuration | 5 variables |
| Reliability | 🟢 Good |
| Rate Limits | 500/day |

---

## ✅ Checklist

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated
- [ ] SMTP_PASSWORD updated in Supabase secrets
- [ ] SMTP_HOST is `smtp.gmail.com` (not `smpt`)
- [ ] SMTP_USER is full email address
- [ ] SMTP_FROM matches SMTP_USER
- [ ] Edge function restarted
- [ ] Test email sent successfully
- [ ] No "Invalid login" errors in logs

---

## 🎉 After Following This Guide

Your email functionality will work perfectly:
- ✅ Future Self Messages send on schedule
- ✅ Personal Reminders arrive on time
- ✅ Password reset emails work
- ✅ No authentication errors

---

**Quick Summary:**
1. Enable 2-Step Verification
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Update SMTP_PASSWORD in Supabase
4. Test by sending a future message