# 📧 Cron Job Setup Guide - Resilio Email Scheduler

## Overview
Resilio ab cron jobs use karti hai scheduled emails (Future Messages aur Personal Reminders) ko bhejne ke liye. Yeh guide aapko step-by-step batayegi ki external cron service kaise setup karen.

---

## 🎯 Kya Hota Hai?

Jab user Future Message ya Reminder schedule karte hain, woh Supabase database mein save ho jate hain. Phir:

1. **External cron service** har 5-10 minutes mein aapke server endpoint ko call karti hai
2. **Server** check karta hai ki koi due messages/reminders hain
3. **Gmail SMTP** ke through emails automatically send ho jate hain
4. **Database** update ho jata hai taaki duplicate emails na bheje jayein

---

## 🔧 Setup Instructions

### **Step 1: Supabase Project ID Copy Karen**

Aapke Supabase project ka URL yeh format mein hoga:
```
https://YOUR_PROJECT_ID.supabase.co
```

**Example:** `https://abcdefgh12345678.supabase.co`

Is URL se `YOUR_PROJECT_ID` ko copy karen.

---

### **Step 2: CRON_API_KEY Check Karen**

Aapke Supabase environment variables mein `CRON_API_KEY` already set hai. Yeh key security ke liye use hoti hai.

**CRON_API_KEY ki value yaad rakhen** (yeh aapne pehle set kar di thi).

---

### **Step 3: Free Cron Service Choose Karen**

Kuch popular free cron services:

#### **Option 1: cron-job.org (Recommended)**
- Website: https://cron-job.org
- Free plan: Unlimited jobs, runs every 1 minute
- Easy to use
- No credit card required

#### **Option 2: EasyCron**
- Website: https://www.easycron.com
- Free plan: 100 executions/day, minimum 1 hour interval
- Less frequent but reliable

#### **Option 3: Uptime Robot**
- Website: https://uptimerobot.com
- Free plan: Checks every 5 minutes
- Primarily for monitoring but works for cron

---

### **Step 4: Cron Job Setup (Using cron-job.org)**

#### **4.1 Account Banayein**
1. https://cron-job.org par jayein
2. "Sign Up" par click karen
3. Email verify karen

#### **4.2 New Cron Job Banayein**
1. Dashboard mein "Create cronjob" par click karen
2. Form fill karen:

**Title:**
```
Resilio Email Scheduler
```

**URL:**
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY
```

**Replace Karen:**
- `YOUR_PROJECT_ID` → Aapki Supabase project ID
- `YOUR_CRON_API_KEY` → Aapki CRON_API_KEY value

**Example:**
```
https://abcdefgh12345678.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=my-secret-cron-key-12345
```

**Schedule:**
- Select "Every 5 minutes" (recommended)
- Ya "Every 1 minute" agar instant delivery chahiye

**Request Method:**
- GET

**Advanced Settings (Optional):**
- Timeout: 30 seconds
- Follow redirects: Yes
- Headers: (Leave empty, api_key URL mein hai)

#### **4.3 Save Karen**
- "Create cronjob" par click karen
- Ab aapka cron job har 5 minutes mein automatically run hoga!

---

### **Step 5: Test Karen**

#### **Manual Test:**
Browser mein yeh URL open karen:
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

Agar yeh response aaya, toh setup successful hai! ✅

---

## 🔍 Troubleshooting

### **Error: "Unauthorized"**
❌ **Problem:** CRON_API_KEY wrong hai
✅ **Solution:** Supabase dashboard mein CRON_API_KEY check karen aur URL mein correct value use karen

### **Error: "SMTP_PASSWORD not configured"**
❌ **Problem:** Gmail SMTP password set nahi hai
✅ **Solution:** Supabase environment variables mein `SMTP_PASSWORD` set karen (Gmail App Password)

### **Emails Nahi Aa Rahe**
1. Supabase Functions logs check karen
2. Spam folder check karen
3. Future Message/Reminder ka date aur time confirm karen
4. `emailSent` field database mein check karen (already sent ho sakta hai)

---

## 📊 Monitoring

### **Cron Job Logs (cron-job.org):**
- Dashboard → Execution log
- Green = Success
- Red = Failed (error details available)

### **Supabase Function Logs:**
1. Supabase dashboard open karen
2. Edge Functions → make-server-40d4d8fd → Logs
3. Search for "🔍 Checking for scheduled emails"

---

## ⚙️ Advanced Configuration

### **Frequency Adjust Karen:**
- **1 minute:** Real-time delivery, but zyada API calls
- **5 minutes:** Recommended, balance between speed aur resource usage
- **10 minutes:** Slower delivery, kam API calls

### **Multiple Cron Services:**
Backup ke liye aap 2 cron services use kar sakte hain (ek primary, ek backup).

---

## 🎉 Done!

Ab aapka Resilio app fully automated scheduled emails bhejne ke liye ready hai:

✅ **Future Messages** → Scheduled date par automatically email
✅ **Personal Reminders** → Scheduled time par automatically email  
✅ **Gmail SMTP** → Aapke khud ke Gmail account se emails
✅ **Secure** → CRON_API_KEY se protected
✅ **Automated** → Koi manual intervention nahi chahiye

---

## 🆘 Support

Agar koi problem hai toh:
1. Supabase Function logs dekhen
2. Cron job execution history dekhen
3. Manual test URL run karen browser mein
4. Environment variables (SMTP_PASSWORD, CRON_API_KEY) verify karen

---

**Happy Journaling with Resilio! 🌟**