# ✅ SMTP Email Configuration - Complete Setup Guide

## Current Status: READY TO USE

Your Resilio application is fully configured for email notifications! All SMTP settings have been provided.

## 📧 Gmail SMTP Configuration

### Credentials Configured:
- **SMTP_HOST**: `smtp.gmail.com`
- **SMTP_PORT**: `587`
- **SMTP_USER**: Your Gmail email address
- **SMTP_PASSWORD**: `lidw vvvg opxc ygbz` (Gmail App Password)
- **SMTP_FROM**: Your Gmail email address

### ✅ Already Configured in Supabase
According to your setup, these secrets have already been added to:
**Supabase Dashboard → Edge Functions → Secrets**

## 🔧 How Email Notifications Work

### 1. Future Self Messages
- When you create a future message with a delivery date
- The scheduler endpoint (`/scheduler/check`) runs periodically
- On the delivery date, an email is sent to your registered email
- The message is marked as sent (`emailSent: true`)

### 2. Personal Reminders
- When you create a reminder with a due date
- The scheduler checks for due reminders
- On the due date, an email notification is sent
- The reminder is marked as sent (`emailSent: true`)

### 3. Journal Entry Summaries (Optional)
- Can be configured to send daily/weekly summaries
- Currently not automated but infrastructure is ready

## 🎯 Email System Files

### Backend Files:
1. **`/supabase/functions/server/email.tsx`**
   - Handles SMTP email sending via Gmail
   - Uses `sendEmailViaSMTP()` function with your App Password
   - Supports HTML email templates

2. **`/supabase/functions/server/scheduler.tsx`**
   - Checks for scheduled emails to send
   - Processes future messages and reminders
   - Endpoint: `/make-server-40d4d8fd/scheduler/check`

3. **`/supabase/functions/server/index.tsx`**
   - Main server with all routes
   - Includes scheduler endpoint registration

### Frontend Components:
1. **`/components/FutureSelfMessaging.tsx`**
   - UI for creating future self messages
   - Saves messages with delivery dates

2. **`/components/PersonalReminders.tsx`**
   - UI for creating reminders
   - Saves reminders with due dates

## 🚀 Testing Email System

### Manual Test (Recommended):

1. **Test the scheduler endpoint directly:**
   ```bash
   curl -X GET "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/scheduler/check" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

2. **Check server logs:**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for:
     - `✅ SMTP credentials configured`
     - `📧 Sending email via SMTP to: ...`
     - `✅ Email sent successfully`

### Create Test Messages:

1. **Future Self Message:**
   - Go to Journal → Future Self Messaging
   - Create a message with today's date or tomorrow
   - Wait for scheduler to run (or call manually)

2. **Personal Reminder:**
   - Go to Journal → Personal Reminders
   - Create a reminder with today's date
   - Wait for scheduler to run (or call manually)

## ⏰ Scheduler Setup Options

### Option 1: Manual Testing
Call the scheduler endpoint manually via the test HTML file:
- Open `/test-scheduler.html` in browser
- Click "Check & Send Scheduled Emails"

### Option 2: Automated Cron Job (Recommended)
Set up a cron job to call the scheduler regularly:

```bash
# Using cron (Linux/Mac)
# Edit crontab: crontab -e
# Add this line to check every hour:
0 * * * * curl -X GET "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/scheduler/check" -H "Authorization: Bearer YOUR_ANON_KEY"

# Or check every 6 hours:
0 */6 * * * curl -X GET "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/scheduler/check" -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Option 3: Third-Party Cron Service
Use a service like:
- **cron-job.org** (Free, reliable)
- **EasyCron** (Free tier available)
- **Zapier** (If you already use it)

Steps:
1. Create account at cron-job.org
2. Create new cron job
3. URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/scheduler/check`
4. Headers: `Authorization: Bearer YOUR_ANON_KEY`
5. Schedule: Every 1 hour (or your preference)

## 🔍 Troubleshooting

### If emails aren't sending:

1. **Check SMTP secrets are set:**
   - Supabase Dashboard → Edge Functions → Secrets
   - Verify all SMTP_* variables exist

2. **Check Gmail App Password:**
   - Make sure you're using the App Password, not your regular Gmail password
   - Format: 16 characters without spaces: `lidwvvvgopxcygbz`
   - Re-generate if needed: https://myaccount.google.com/apppasswords

3. **Check server logs:**
   - Look for SMTP connection errors
   - Check for authentication failures
   - Verify email addresses are correct

4. **Verify Gmail settings:**
   - 2-Factor Authentication must be enabled
   - "Less secure app access" is NOT needed (you're using App Password)
   - Check Gmail account isn't locked

5. **Test email function directly:**
   - Use the `/test-email-system.html` file
   - This will show detailed error messages

### Common Error Messages:

- **"SMTP credentials not configured"**
  → Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in Supabase secrets

- **"Invalid login: 535-5.7.8 Username and Password not accepted"**
  → Re-generate Gmail App Password and update SMTP_PASSWORD

- **"Network error" or "Connection timeout"**
  → Check SMTP_HOST is `smtp.gmail.com` and PORT is `587`

## 📊 Database Structure

### Messages stored in KV store:
- **Future Messages:** `future_message_{id}`
- **Reminders:** `reminder_{id}`
- **Both include:**
  - `userId`: User who created it
  - `emailSent`: Boolean flag (false → needs sending, true → already sent)
  - `deliveryDate` or `dueDate`: When to send

## 🎨 Email Templates

Email templates are defined in `/supabase/functions/server/scheduler.tsx`:

- **Future Self Message Email:**
  - Subject: "📬 Your Message from the Past"
  - Includes: Message content, original creation date

- **Personal Reminder Email:**
  - Subject: "🔔 Reminder: [Title]"
  - Includes: Reminder title, description, priority

### Customize Templates:
Edit the `emailHtml` variable in `scheduler.tsx` to change:
- Colors and styling
- Email layout
- Additional information

## ✅ Verification Checklist

- [x] WebAssembly error fixed (client.tsx deleted)
- [x] Cache clearing mechanism in place
- [x] User authentication with access tokens
- [x] User data isolation (userId tracking)
- [x] SMTP credentials configured
- [x] Email scheduler endpoint created
- [x] Future Self Messaging saves with userId
- [x] Personal Reminders saves with userId
- [x] Email templates ready
- [ ] Scheduler cron job set up (Manual step required)
- [ ] Test emails sent successfully (Manual test required)

## 🔐 Security Notes

1. **Gmail App Password** is stored securely in Supabase Edge Function Secrets
2. **Never commit** SMTP credentials to code
3. **Access tokens** are required for all user-specific operations
4. **Email addresses** are stored per user in authentication system

## 📞 Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Review the test files in project root
3. Verify all environment variables are set
4. Test with a simple future message for today's date

---

**Your email system is ready to use! 🎉**

Next step: Set up a cron job to automatically call the scheduler endpoint.
