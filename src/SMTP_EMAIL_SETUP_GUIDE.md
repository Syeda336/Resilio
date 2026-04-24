# 📧 SMTP Email Setup Guide for Resilio

## Overview
Your Resilio app now uses **SMTP** to send email notifications for:
- ✅ **Future Self Messages** - When scheduled messages are due
- ✅ **Personal Reminders** - When reminders are due

## 🎯 What Changed

### Before
- No email notifications
- Scheduled emails weren't being sent

### After
- ✅ Emails sent via SMTP (Simple Mail Transfer Protocol)
- ✅ Beautiful HTML email templates
- ✅ Automatic scheduler checks for due messages/reminders
- ✅ User authentication integrated

---

## 🔧 Setup Options

You have **2 options** for sending emails:

### Option 1: Gmail SMTP (Recommended for Testing)
**Easiest to set up, perfect for development and personal use**

### Option 2: Supabase Auth SMTP
**Use Supabase's built-in SMTP from Authentication settings**

---

## 📋 Option 1: Gmail SMTP Setup

### Step 1: Enable Gmail SMTP

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Scroll down to **2-Step Verification** and enable it (if not already)
4. After enabling 2-Step, go back to Security
5. Search for **App Passwords**
6. Click **App Passwords**
7. Select:
   - **App:** Mail
   - **Device:** Other (Custom name)
   - **Name:** Resilio App
8. Click **Generate**
9. **Copy the 16-character password** (you'll need this!)

### Step 2: Add SMTP Credentials to Supabase

1. Go to your Supabase Project Dashboard:
   ```
   https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc
   ```

2. Click **Settings** (gear icon) in left sidebar

3. Click **Edge Functions** under Settings

4. Click **Manage secrets**

5. Add these environment variables:

   | Secret Name | Secret Value | Example |
   |-------------|--------------|---------|
   | `SMTP_HOST` | `smtp.gmail.com` | smtp.gmail.com |
   | `SMTP_PORT` | `587` | 587 |
   | `SMTP_USER` | Your Gmail address | yourname@gmail.com |
   | `SMTP_PASSWORD` | The 16-char app password | abcd efgh ijkl mnop |
   | `SMTP_FROM` | Your Gmail address | yourname@gmail.com |

6. Click **Save**

7. **Restart your Edge Function** (if it's deployed)

### Step 3: Test It!

1. Open your Resilio app
2. Create a **reminder** with a date/time in the past (e.g., yesterday)
3. Call the scheduler endpoint:
   ```
   https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
   ```
4. Check your email inbox!

---

## 📋 Option 2: Supabase Auth SMTP Setup

### Step 1: Configure SMTP in Supabase

1. Go to Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc
   ```

2. Click **Authentication** in left sidebar

3. Click **Email Templates**

4. Click **SMTP Settings** tab

5. Enable **Enable Custom SMTP**

6. Fill in your SMTP details:
   - **Host:** (e.g., smtp.gmail.com)
   - **Port:** (e.g., 587)
   - **Username:** (your email)
   - **Password:** (your app password)
   - **Sender name:** Resilio
   - **Sender email:** (your email)

7. Click **Save**

### Step 2: Remove Explicit SMTP Environment Variables

If using Supabase's built-in SMTP, you don't need to set the SMTP_* environment variables. The email service will automatically use Supabase's configured SMTP.

---

## 🚀 How It Works

### Architecture

```
┌─────────────────┐
│   User Creates  │
│    Reminder     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│   Stored in Database        │
│   with userId and emailSent │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Cron Job (Every Minute)   │
│   OR Manual Trigger         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Scheduler Checks:         │
│   - Is reminder past due?   │
│   - Email already sent?     │
│   - User exists?            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Gets User Email from      │
│   Supabase Authentication   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Sends Email via SMTP      │
│   - Beautiful HTML template │
│   - Personalized content    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Marks emailSent = true    │
│   (Won't send again)        │
└─────────────────────────────┘
```

### Email Flow

1. **User creates reminder/message** → Saved with `userId` and `emailSent: false`
2. **Scheduler runs** → Checks all reminders/messages
3. **Finds due items** → `scheduledTime <= now` AND `emailSent === false`
4. **Gets user email** → From Supabase Auth using `userId`
5. **Sends email** → Via SMTP with HTML template
6. **Marks as sent** → Updates `emailSent: true` and `emailSentAt: timestamp`

---

## 🔔 Scheduler Endpoint

### Manual Trigger
You can manually trigger the scheduler:

```bash
curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

### Response
```json
{
  "success": true,
  "results": {
    "remindersSent": 2,
    "messagesSent": 1,
    "errors": []
  },
  "timestamp": "2024-11-28T15:30:00.000Z"
}
```

### Set Up Cron Job (Automated)

To automatically check every minute, you can use:

#### Option A: Supabase Cron Extension (Coming Soon)
Supabase is working on native cron job support

#### Option B: External Cron Service

Use a free service like:

1. **cron-job.org**
   - Go to: https://cron-job.org
   - Create free account
   - Add new cron job
   - URL: `https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails`
   - Schedule: Every 1 minute
   - Save

2. **EasyCron**
   - Go to: https://www.easycron.com
   - Similar setup

3. **GitHub Actions**
   - Create a workflow that runs every minute
   - Calls your endpoint

---

## 📧 Email Templates

### Future Message Email
```
Subject: ✨ Message from Your Past Self - Resilio

Beautiful green gradient header
User's name
Message content in highlighted box
Reflection prompt
Resilio branding footer
```

### Reminder Email
```
Subject: 🔔 Reminder: [Task Name] - Resilio

Beautiful orange gradient header
User's name
Task in highlighted box
Helpful tip
Resilio branding footer
```

---

## 🧪 Testing Your Setup

### Test 1: Create Past Reminder
```
1. Go to Resilio app
2. Navigate to Journal → Reminders
3. Create new reminder:
   - Task: "Test Email"
   - Date: Yesterday
   - Time: 10:00 AM
4. Save
```

### Test 2: Trigger Scheduler
```bash
curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

### Test 3: Check Results
```
1. Check response JSON for remindersSent: 1
2. Check your email inbox
3. Look for email from Resilio
4. Check spam folder if not in inbox
```

### Test 4: Verify No Duplicate
```bash
# Call scheduler again
curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails

# Should show remindersSent: 0 (already sent)
```

---

## 🔍 Troubleshooting

### Problem: Emails Not Sending

#### Check 1: SMTP Credentials
```bash
# In Supabase Edge Functions secrets, verify:
SMTP_USER = your email
SMTP_PASSWORD = app password (not regular password!)
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
```

#### Check 2: User Has Email
```
1. Go to Supabase Dashboard → Authentication → Users
2. Find user who created reminder
3. Verify email address exists
```

#### Check 3: Reminder Is Due
```
1. Check reminder scheduledDate and scheduledTime
2. Make sure it's in the PAST
3. Current time must be >= scheduled time
```

#### Check 4: Not Already Sent
```
1. Check reminder object
2. emailSent should be false
3. If true, it won't send again
```

#### Check 5: Check Logs
```
1. Go to Supabase Dashboard
2. Edge Functions → Logs
3. Look for error messages
```

### Problem: Gmail Blocking

If Gmail blocks the emails:

1. **Use App Password** (not regular password)
2. **Enable 2-Step Verification** first
3. **Check Gmail security settings**:
   - Go to https://myaccount.google.com/security
   - Check for blocked sign-in attempts
   - Allow less secure apps if needed

### Problem: Emails in Spam

If emails go to spam:

1. **Add sender to contacts**
2. **Mark as "Not Spam"**
3. **Check SPF/DKIM** (advanced - Gmail handles this)

---

## 📊 Monitoring

### Check Scheduler Activity

```bash
# Call scheduler and check response
curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

### View Sent Emails

Check the reminder/message objects in database:
- `emailSent: true` means sent
- `emailSentAt: timestamp` shows when sent

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click **Edge Functions**
3. Click **Logs**
4. Look for:
   - `📧 Sending email to...`
   - `✅ Email sent successfully`
   - `❌ Email send error...`

---

## 🎯 Summary

### Files Created
- ✅ `/supabase/functions/server/email.tsx` - Email service with SMTP
- ✅ `/supabase/functions/server/scheduler.tsx` - Scheduler logic
- ✅ Updated `/supabase/functions/server/index.tsx` - Added endpoints

### Endpoints Added
- ✅ `GET /make-server-40d4d8fd/cron/check-scheduled-emails` - Scheduler

### Features
- ✅ Beautiful HTML email templates
- ✅ Personalized with user's name
- ✅ Sends via SMTP (Gmail or custom)
- ✅ Tracks sent status to prevent duplicates
- ✅ User authentication integrated
- ✅ Detailed error logging

### Next Steps
1. ✅ Set up Gmail App Password
2. ✅ Add SMTP secrets to Supabase
3. ✅ Test with past reminder
4. ✅ Set up cron job for automation
5. ✅ Monitor logs and emails

---

## 🚀 Quick Start Checklist

- [ ] Create Gmail App Password
- [ ] Add SMTP secrets to Supabase Edge Functions
- [ ] Create test reminder with past date
- [ ] Call scheduler endpoint manually
- [ ] Check email inbox (and spam)
- [ ] Verify email was sent
- [ ] Set up cron job for automation
- [ ] Create real reminders/messages
- [ ] Enjoy automated email notifications! 🎉

---

**Your email notification system is now ready!** 📧✨
