# 🚀 Quick Start: Email Notifications

## ⚡ 5-Minute Setup

### 1️⃣ Get Gmail App Password (2 min)
```
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Search "App Passwords"
4. Create password for "Mail"
5. Copy the 16-character password
```

### 2️⃣ Add to Supabase (2 min)
```
1. Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/settings/functions
2. Click "Manage secrets"
3. Add these 5 secrets:

   SMTP_HOST       = smtp.gmail.com
   SMTP_PORT       = 587
   SMTP_USER       = your-email@gmail.com
   SMTP_PASSWORD   = your-16-char-app-password
   SMTP_FROM       = your-email@gmail.com

4. Click "Save"
```

### 3️⃣ Test It (1 min)
```
1. Open: /test-email-system.html
2. Click "Create Test Reminder" (it will use yesterday's date)
3. Click "Run Email Scheduler Now"
4. Check your email inbox! 📧
```

---

## ✅ Checklist

- [ ] Created Gmail App Password
- [ ] Added 5 SMTP secrets to Supabase
- [ ] Tested with `/test-email-system.html`
- [ ] Received test email
- [ ] Set up cron job (optional but recommended)

---

## 📖 Full Documentation

- **Setup Guide:** `/SMTP_EMAIL_SETUP_GUIDE.md`
- **Testing Tool:** `/test-email-system.html`
- **Complete Summary:** `/EMAIL_SYSTEM_SUMMARY.md`

---

## 🔗 Quick Links

| Link | Purpose |
|------|---------|
| [Gmail Security](https://myaccount.google.com/security) | Get App Password |
| [Supabase Functions](https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/settings/functions) | Add SMTP Secrets |
| [Test Tool](/test-email-system.html) | Test Emails |
| [Cron Setup](https://cron-job.org) | Automate (Optional) |

---

## 🎯 What You Get

✅ Beautiful email templates with gradients
✅ Automated reminders sent to your inbox
✅ Future self messages delivered on schedule
✅ Personalized with your name
✅ Professional design
✅ Works on all devices

---

## 🆘 Need Help?

### Quick Fixes

**Problem:** Not receiving emails
- **Solution:** Check spam folder first!

**Problem:** Invalid password error
- **Solution:** Use App Password, not regular Gmail password

**Problem:** Nothing happens
- **Solution:** Make sure reminder date is in the PAST

---

## 🎉 You're Done!

Once you've completed the 3 steps above, your email system is ready!

**Test it now:**
1. Create a reminder for tomorrow
2. Wait for tomorrow
3. Receive automatic email! 📧

Or use `/test-email-system.html` to test immediately with a past date.

---

**Total Setup Time: ~5 minutes** ⏱️

**Enjoy your automated email notifications!** 🚀✨
