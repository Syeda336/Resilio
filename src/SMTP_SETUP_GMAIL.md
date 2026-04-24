# 📧 Gmail SMTP Setup Guide - Complete Migration from Resend

## ✅ Migration Complete!

I've switched your email system from **Resend** to **Gmail SMTP**!

**Why Gmail SMTP?**
- ✅ No sandbox mode - send to ANYONE immediately!
- ✅ No domain verification needed
- ✅ Free: 100 emails per day
- ✅ Reliable delivery via Google
- ✅ Simple 5-minute setup

---

## 🎯 What Changed

### Old System (Resend):
- ❌ Sandbox mode - only sent to maryamraza900@gmail.com
- ❌ Required domain verification
- ❌ Complex setup

### New System (Gmail SMTP):
- ✅ Sends to ANY email address
- ✅ No domain needed
- ✅ Works immediately after setup

---

## 🔧 Setup Steps (5 Minutes)

### Step 1: Create Google App Password

1. **Go to Google Account:**
   - Visit: https://myaccount.google.com/security
   - Sign in with `maryamraza900@gmail.com`

2. **Enable 2-Step Verification (if not already enabled):**
   - Click "2-Step Verification"
   - Follow the setup wizard
   - Use your phone number for verification
   - Enable 2-Step Verification

3. **Create App Password:**
   - After 2-Step is enabled, go back to Security
   - Scroll to "2-Step Verification" section
   - Click "App passwords" (at the bottom)
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: **Resilio App**
   - Click **Generate**
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
   - **Save it somewhere safe!** You won't see it again

---

### Step 2: Add SMTP Credentials to Supabase

Run these commands in your terminal (one by one):

```bash
# Gmail SMTP Configuration
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=maryamraza900@gmail.com
supabase secrets set SMTP_PASSWORD="your-16-char-app-password"
supabase secrets set SMTP_FROM="Resilio <maryamraza900@gmail.com>"
```

**Replace `your-16-char-app-password` with the actual app password from Step 1!**

**Example:**
```bash
supabase secrets set SMTP_PASSWORD="abcd efgh ijkl mnop"
```

---

### Step 3: Deploy Edge Function

```bash
supabase functions deploy make-server-40d4d8fd
```

Wait for deployment to complete (~30 seconds).

---

### Step 4: Test!

1. **Open your Resilio app**
2. **Go to Future Self Messaging**
3. **Write a test message:**
   - Message: "Testing new Gmail SMTP!"
   - Date: Tomorrow
   - Time: Any time
4. **Click "Schedule Message"**
5. **Check the email address inbox** (the one you signed up with in Resilio)
6. ✅ **You should receive the email immediately!**

---

## 📊 What's Different Now

### Email Sending Flow:

**Before (Resend):**
```
App → Server → Resend API → ❌ Only maryamraza900@gmail.com
```

**After (Gmail SMTP):**
```
App → Server → Gmail SMTP → ✅ ANY email address!
```

### Features:

| Feature | Before (Resend) | After (Gmail SMTP) |
|---------|----------------|-------------------|
| **Send to Anyone** | ❌ No (sandbox) | ✅ Yes |
| **Domain Required** | ✅ Yes | ❌ No |
| **Setup Time** | 30 min | 5 min |
| **Cost** | Free | Free |
| **Email Limit** | 100/day | 100/day |
| **Professional Sender** | After domain verify | Immediately |

---

## 🎯 Test All Features

After setup, test these:

### 1. ✅ Future Self Messages
1. Go to Future Self Messaging
2. Write a message
3. Schedule it
4. Check recipient inbox
5. ✅ Email received!

### 2. ✅ Personal Reminders
1. Go to Personal Reminders
2. Add a reminder
3. Enter task, date, time
4. Click "Add Reminder"
5. Check recipient inbox
6. ✅ Email received!

### 3. ✅ Password Reset
1. Go to login page
2. Click "Forgot Password?"
3. Enter email
4. Click "Send Reset Link"
5. Check email inbox
6. ✅ Reset email received!

---

## 🔍 Troubleshooting

### Issue 1: "SMTP credentials not configured"

**Solution:**
- Make sure you ran all `supabase secrets set` commands
- Check for typos in the commands
- Redeploy: `supabase functions deploy make-server-40d4d8fd`

---

### Issue 2: "Authentication failed"

**Possible causes:**
1. **Wrong app password** - Double-check the 16-character password
2. **2-Step Verification not enabled** - Must enable it first
3. **Spaces in password** - Remove spaces when entering

**Solution:**
```bash
# Delete old password
supabase secrets unset SMTP_PASSWORD

# Set new one (without spaces!)
supabase secrets set SMTP_PASSWORD="abcdefghijklmnop"

# Redeploy
supabase functions deploy make-server-40d4d8fd
```

---

### Issue 3: Email not received

**Check:**
1. **Spam folder** - Gmail might filter it
2. **Correct email address** - Check user profile
3. **SMTP logs** - Check Supabase Edge Function logs

**Solution:**
```bash
# Check logs
supabase functions logs make-server-40d4d8fd

# Look for:
# "📧 Sending email via SMTP to: ..."
# "✅ Email sent successfully via SMTP to: ..."
```

---

### Issue 4: "Connection timeout"

**Possible causes:**
- Firewall blocking port 587
- Network issues
- Google blocking suspicious activity

**Solution:**
1. Check Google account security: https://myaccount.google.com/security
2. Look for "Critical security alert"
3. Allow access if prompted
4. Try again

---

## 📝 Configuration Reference

### Environment Variables Set:

```bash
SMTP_HOST=smtp.gmail.com        # Gmail SMTP server
SMTP_PORT=587                    # TLS port
SMTP_USER=maryamraza900@gmail.com  # Your Gmail
SMTP_PASSWORD=****************   # App password (hidden)
SMTP_FROM="Resilio <maryamraza900@gmail.com>"  # Sender name & email
```

### Email Functions:

All three email functions now use Gmail SMTP:

1. **`sendFutureMessageEmail()`** - Future self messages
2. **`sendReminderEmail()`** - Personal reminders
3. **`sendPasswordResetEmail()`** - Password reset (uses Supabase Auth + custom template)

---

## 🎨 Email Templates

All emails use beautiful HTML templates:

### Future Messages:
- Purple gradient header
- Clean white body
- Message preview
- Scheduled date display

### Reminders:
- Orange gradient header
- Task details
- Date and time
- Confirmation message

### Password Reset:
- Pink gradient header
- Reset button
- Security warning
- Fallback link

---

## 🔐 Security Notes

1. **App Password is NOT your Gmail password**
   - It's a special 16-character code
   - Only for this app
   - Can be revoked anytime

2. **Keep App Password Secret**
   - Don't share it
   - Don't commit to git
   - Stored securely in Supabase secrets

3. **Revoke if Compromised**
   - Go to: https://myaccount.google.com/apppasswords
   - Click "Remove" next to "Resilio App"
   - Generate new one
   - Update in Supabase

---

## 📈 Limits & Scaling

### Gmail Free Tier:
- **100 emails per day**
- Resets at midnight PST
- Shared across all apps using your Gmail

### If You Need More:
1. **Use multiple Gmail accounts** (100 each)
2. **Upgrade to Google Workspace** (~$6/month, 2000/day)
3. **Switch to SendGrid** (100/day free, then paid)
4. **Use Amazon SES** (~$0.10 per 1000 emails)

---

## 🚀 Upgrade Options

### Option 1: SendGrid (Free Tier)
- 100 emails/day free
- Better deliverability
- Email analytics
- Setup: Similar to Gmail

### Option 2: Amazon SES
- Very cheap (~$0.10/1000 emails)
- 62,000 free/month (first year)
- Highly scalable
- Setup: More complex

### Option 3: Google Workspace
- Professional email
- Custom domain
- 2,000 emails/day
- $6/month per user

---

## ✅ Success Checklist

After setup, verify:

- [ ] 2-Step Verification enabled on Gmail
- [ ] App password created and saved
- [ ] All SMTP secrets set in Supabase
- [ ] Edge Function deployed
- [ ] Future message test email received
- [ ] Reminder test email received
- [ ] Password reset test email received
- [ ] Emails going to correct recipients
- [ ] Not going to maryamraza900@gmail.com only
- [ ] Check spam folder is clear

---

## 🎉 You're Done!

Your email system is now using Gmail SMTP!

**Benefits:**
- ✅ Send to ANY email address
- ✅ No more sandbox mode
- ✅ No domain verification needed
- ✅ Works immediately
- ✅ Free and reliable

**Test it now:**
1. Schedule a future message to a friend
2. It will arrive in their inbox!
3. No more maryamraza900@gmail.com restrictions!

---

## 📞 Need Help?

If you encounter issues:

1. **Check Supabase logs:**
   ```bash
   supabase functions logs make-server-40d4d8fd
   ```

2. **Verify secrets are set:**
   ```bash
   supabase secrets list
   ```
   Should show: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM

3. **Test SMTP connection:**
   - Send a test future message
   - Check logs for "✅ Email sent successfully"

4. **Google Account Security:**
   - Check: https://myaccount.google.com/security
   - Look for any security alerts

---

## 🔄 Rollback (If Needed)

If you want to go back to Resend:

```bash
# Remove SMTP secrets
supabase secrets unset SMTP_HOST
supabase secrets unset SMTP_PORT
supabase secrets unset SMTP_USER
supabase secrets unset SMTP_PASSWORD
supabase secrets unset SMTP_FROM

# Change import back in index.tsx
# From: import { sendFutureMessageEmail, sendReminderEmail } from './email_smtp.tsx';
# To:   import { sendFutureMessageEmail, sendReminderEmail } from './email.tsx';

# Deploy
supabase functions deploy make-server-40d4d8fd
```

---

**Happy emailing! 📧✨**

**Questions? Issues? Check the logs or refer back to this guide!**
