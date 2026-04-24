# 📧 Cron Job Setup Instructions - Resilio Email Scheduler

## Quick Start

Your Resilio app now uses **cron jobs** to automatically send scheduled emails (Future Messages and Personal Reminders) at the exact date and time specified by users.

---

## 🎯 How It Works

1. **External cron service** calls your server endpoint every 5-10 minutes
2. **Server** checks for due messages/reminders in the database
3. **Gmail SMTP** sends emails automatically
4. **Database** gets updated to prevent duplicate emails

---

## 🔧 Setup Steps

### **1. Get Your Supabase Project ID**

Your Supabase URL looks like:
```
https://YOUR_PROJECT_ID.supabase.co
```

Copy the `YOUR_PROJECT_ID` part.

---

### **2. Get Your CRON_API_KEY**

This is already set in your Supabase environment variables. Note down the value.

---

### **3. Choose a Free Cron Service**

**Recommended: cron-job.org**
- Website: https://cron-job.org
- Free: Unlimited jobs, runs every 1 minute
- No credit card required

**Alternatives:**
- EasyCron: https://www.easycron.com
- Uptime Robot: https://uptimerobot.com

---

### **4. Create the Cron Job**

#### **On cron-job.org:**

1. Sign up at https://cron-job.org
2. Click "Create cronjob"
3. Fill in:

**Title:**
```
Resilio Email Scheduler
```

**URL:**
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY
```

**Replace:**
- `YOUR_PROJECT_ID` with your actual Supabase project ID
- `YOUR_CRON_API_KEY` with your actual CRON_API_KEY value

**Schedule:**
- Every 5 minutes (recommended)
- Or every 1 minute for instant delivery

**Request Method:**
- GET

4. Click "Create cronjob"

---

### **5. Test the Setup**

Open this URL in your browser:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY
```

**Expected Response:**
```json
{
  "success": true,
  "results": {
    "remindersSent": 0,
    "messagesSent": 0,
    "errors": []
  },
  "timestamp": "2026-03-11T..."
}
```

If you see this, setup is successful! ✅

---

## 🔍 Troubleshooting

### **"Unauthorized" Error**
- Check your CRON_API_KEY is correct in Supabase environment variables
- Verify the URL includes the correct api_key parameter

### **"SMTP_PASSWORD not configured" Error**
- Set `SMTP_PASSWORD` in Supabase environment variables
- Use your Gmail App Password (16 characters)

### **Emails Not Arriving**
1. Check Supabase Function logs
2. Check spam folder
3. Verify scheduled date/time is in the future
4. Check if `emailSent` field is already true in database

---

## 📊 Monitoring

### **Cron Job Logs:**
- Go to cron-job.org dashboard
- Check "Execution log"
- Green = Success, Red = Failed

### **Supabase Function Logs:**
- Supabase dashboard → Edge Functions → Logs
- Look for "🔍 Checking for scheduled emails"

---

## ⚙️ Configuration Options

### **Frequency:**
- **1 minute:** Real-time delivery (more API calls)
- **5 minutes:** Recommended (balance)
- **10 minutes:** Slower delivery (fewer API calls)

---

## 🎉 You're All Set!

Your Resilio app now automatically sends:

✅ **Future Messages** → Delivered at scheduled date/time via email  
✅ **Personal Reminders** → Delivered at scheduled date/time via email  
✅ **Gmail SMTP** → Uses your own Gmail account  
✅ **Secure** → Protected with CRON_API_KEY  
✅ **Automated** → No manual intervention needed

---

## 📝 Important Notes

- The cron job endpoint is **secured** with CRON_API_KEY
- Emails are sent via **Gmail SMTP** (not Resend)
- Each message/reminder is sent **only once** (tracked by `emailSent` field)
- The system checks for due items every time the cron runs
- Logs are available in both cron-job.org and Supabase

---

**Happy Journaling! 🌟**
