# 📧 Email Setup Guide - Use Your Own Email Account

## Current Status ✅
Your app is configured to send emails using **SMTP with Nodemailer** - a reliable email sending library that works with ANY email provider!

**Right Now**:
- ✅ No errors - Everything works
- ✅ Without SMTP config → Emails log to console (demo mode)
- ✅ With SMTP config → Real emails get sent to any address! 📬

## Quick Setup Options

### Option 1: Gmail (Most Popular) ⭐

#### Step 1: Enable App Passwords in Gmail
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", enable **2-Step Verification** (if not already enabled)
4. After enabling 2FA, go back to Security
5. Under "How you sign in to Google", click **App passwords**
6. Select app: **Mail**
7. Select device: **Other (Custom name)** → Type "Resilio"
8. Click **Generate**
9. Copy the 16-character password (e.g., "abcd efgh ijkl mnop")

#### Step 2: Add to Supabase Secrets
Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets

Add these 5 secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `SMTP_HOST` | `smtp.gmail.com` | smtp.gmail.com |
| `SMTP_PORT` | `587` | 587 |
| `SMTP_USER` | Your Gmail address | your.email@gmail.com |
| `SMTP_PASSWORD` | The 16-char app password | abcd efgh ijkl mnop |
| `SMTP_FROM` | Your Gmail address | your.email@gmail.com |

**Done!** Emails will now be sent via your Gmail account! 🎉

---

### Option 2: Outlook/Hotmail

#### Step 1: Add to Supabase Secrets

| Secret Name | Value |
|------------|-------|
| `SMTP_HOST` | `smtp-mail.outlook.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your-email@outlook.com |
| `SMTP_PASSWORD` | Your Outlook password |
| `SMTP_FROM` | your-email@outlook.com |

**Note**: If you have 2FA enabled, you'll need to generate an app password:
1. Go to account.microsoft.com
2. Security → Advanced security options
3. App passwords → Create new app password

---

### Option 3: Yahoo Mail

#### Step 1: Generate App Password
1. Go to Yahoo Account Security
2. Enable 2-Step Verification
3. Generate app password for "Mail"

#### Step 2: Add to Supabase Secrets

| Secret Name | Value |
|------------|-------|
| `SMTP_HOST` | `smtp.mail.yahoo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your-email@yahoo.com |
| `SMTP_PASSWORD` | Your app password |
| `SMTP_FROM` | your-email@yahoo.com |

---

### Option 4: Custom SMTP Server

If you have a custom email server or business email:

| Secret Name | Value | Notes |
|------------|-------|-------|
| `SMTP_HOST` | Your SMTP host | e.g., mail.yourdomain.com |
| `SMTP_PORT` | `587` or `465` | Use 587 for TLS, 465 for SSL |
| `SMTP_USER` | Your email username | Usually your email address |
| `SMTP_PASSWORD` | Your email password | Or app-specific password |
| `SMTP_FROM` | Sender email address | Same as SMTP_USER typically |

---

## How to Add Secrets to Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Click Settings** (bottom left gear icon)
4. **Click Edge Functions** in the sidebar
5. **Scroll to "Secrets" section**
6. **Click "Add new secret"** for each one
7. **Enter Name and Value** from tables above
8. **Click "Create secret"**

Repeat for all 5 secrets.

---

## Testing Your Setup

### Without SMTP Config (Current State):
1. Create a Future Message or Reminder
2. Check Supabase Logs → You'll see email details logged
3. No errors! ✅

### After Adding SMTP Secrets:
1. Create a Future Message or Reminder
2. **Check your email inbox** → Real email arrives! 📬
3. Check Supabase Logs → See success messages

---

## Troubleshooting

### "Invalid login" or "Authentication failed"
- **Gmail**: Make sure you're using an **App Password**, not your regular Gmail password
- **Outlook/Yahoo**: Check if 2FA is enabled and use app password
- **All**: Double-check username and password have no extra spaces

### Emails not arriving?
1. **Check spam/junk folder** first
2. **Check Supabase logs** for error messages
3. **Verify all 5 secrets** are added correctly (no typos!)
4. **Try port 465** instead of 587 if using SSL

### "Connection timeout"
- Try changing `SMTP_PORT` from `587` to `465`
- Check if your email provider requires specific settings

### Still having issues?
Check Edge Function logs in Supabase:
```
Edge Functions → make-server-40d4d8fd → Logs
```

Look for:
- `✅ Email sent successfully to: user@email.com` = Working!
- `⚠️ SMTP not configured` = Secrets not added yet
- Error messages = Check the specific error and fix accordingly

---

## Security Notes

✅ **Safe**: Environment variables are encrypted in Supabase
✅ **Private**: SMTP credentials never leave your server
✅ **Secure**: Using app passwords (not your main password)
⚠️ **Important**: Never commit credentials to code!

---

## Email Limits

Different providers have different sending limits:

| Provider | Daily Limit | Notes |
|----------|------------|-------|
| **Gmail** | 500 emails/day | Personal accounts |
| **Gmail (Workspace)** | 2,000 emails/day | Business accounts |
| **Outlook** | 300 emails/day | Personal accounts |
| **Yahoo** | 500 emails/day | Personal accounts |

For a personal journal app, these limits are more than enough! 🎉

---

## Benefits of This Approach

✅ **Free** - Use your existing email account
✅ **No Sign-ups** - No need for Brevo, Resend, SendGrid, etc.
✅ **Full Control** - Your own email, your own sender name
✅ **Reliable** - Uses proven Nodemailer library
✅ **Flexible** - Works with ANY SMTP server
✅ **Private** - Your data stays with your email provider

---

## Files Changed

1. **Created**: `/supabase/functions/server/email_nodemailer.tsx`
   - Nodemailer SMTP integration
   - Fallback to console logging without config
   - Beautiful HTML email templates

2. **Updated**: `/supabase/functions/server/index.tsx`
   - Imports from `email_nodemailer.tsx`

3. **Updated**: `/supabase/functions/server/scheduler.tsx`
   - Uses `email_nodemailer.tsx` for scheduled emails

---

**Ready to send emails? Follow the setup steps above for your email provider! 🚀**

**Already done? Test it by creating a reminder or future message!**
