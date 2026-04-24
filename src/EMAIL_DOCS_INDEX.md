# 📧 Email Scheduling Documentation - Index

## 🚀 Quick Navigation

### For First-Time Setup
👉 **[EMAIL_QUICK_START.md](./EMAIL_QUICK_START.md)** - Start here! (5 minutes)

### For Understanding How It Works
👉 **[EMAIL_TIMING_GUIDE.md](./EMAIL_TIMING_GUIDE.md)** - Email timing & scheduling explained

### For Complete Setup Instructions
👉 **[EMAIL_SCHEDULING_SETUP.md](./EMAIL_SCHEDULING_SETUP.md)** - Full setup guide with testing

### For CRON Configuration
👉 **[SUPABASE_CRON_SETUP.md](./SUPABASE_CRON_SETUP.md)** - Detailed CRON job setup & troubleshooting

### For Technical Overview
👉 **[EMAIL_SYSTEM_SUMMARY.md](./EMAIL_SYSTEM_SUMMARY.md)** - Complete system architecture & implementation

---

## 📖 What Each Document Covers

### 1. EMAIL_QUICK_START.md
**Best for:** Just want it to work ASAP
- ⚡ 5-minute setup
- ✅ Copy-paste SQL commands
- 🧪 Quick test instructions

### 2. EMAIL_TIMING_GUIDE.md
**Best for:** Understanding when emails send
- ⏰ How timing works (5-minute intervals)
- 📊 Timing examples
- 🕐 Why emails send within 0-5 minutes

### 3. EMAIL_SCHEDULING_SETUP.md
**Best for:** Comprehensive setup
- 🔧 Database table creation
- 🚀 CRON job setup
- 🧪 Complete testing guide
- 🐛 Troubleshooting common issues

### 4. SUPABASE_CRON_SETUP.md
**Best for:** Advanced CRON configuration
- 📋 Step-by-step CRON setup
- 🧪 Multiple testing methods
- 📊 Monitoring dashboard
- 🔧 Advanced configuration (custom schedules)

### 5. EMAIL_SYSTEM_SUMMARY.md
**Best for:** Technical details & architecture
- 🏗️ System architecture diagram
- 📂 Key files & their purpose
- 🕐 Timezone handling explained
- 🔒 Security features
- 📊 Performance metrics

---

## 🎯 Common Use Cases

### "I just want emails to work"
→ Read: **EMAIL_QUICK_START.md**

### "Why is my email late by 3 minutes?"
→ Read: **EMAIL_TIMING_GUIDE.md**

### "CRON job not working"
→ Read: **SUPABASE_CRON_SETUP.md** → Troubleshooting section

### "Email sent immediately instead of scheduled time"
→ Read: **EMAIL_SCHEDULING_SETUP.md** → Testing section

### "I want to understand the whole system"
→ Read: **EMAIL_SYSTEM_SUMMARY.md**

---

## ✅ Current System Status

### Features Implemented
- ✅ **Future Self Messages** - Send messages to future self
- ✅ **Personal Reminders** - Get reminder emails
- ✅ **Diet Plan - Food Database** - Food nutrition emails
- ✅ **Diet Plan - Meal Planner** - Meal plan emails

### Technical Implementation
- ✅ **Email Queue System** - Reliable background processing
- ✅ **CRON Job** - Automatic checking every 5 minutes
- ✅ **Timezone Handling** - Correct local time conversion
- ✅ **Auto-retry** - Failed emails retry up to 3 times
- ✅ **Status Tracking** - pending/sent/failed monitoring

### Requirements
- ✅ Supabase project
- ✅ Edge Function deployed
- ✅ SMTP configured (Gmail app password)
- ✅ CRON job enabled (pg_cron extension)

---

## 🔍 Quick Reference

### Important SQL Queries

**Check CRON status:**
```sql
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';
```

**View pending emails:**
```sql
SELECT * FROM email_queue WHERE status = 'pending' ORDER BY scheduled_for;
```

**View recent CRON runs:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'resilio-email-scheduler')
ORDER BY start_time DESC LIMIT 5;
```

### Important URLs

**CRON endpoint:**
```
https://YOUR_PROJECT.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

**Supabase Dashboard:**
```
https://supabase.com/dashboard
```

---

## 🆘 Getting Help

### Common Issues & Solutions

| Issue | Solution Document | Section |
|-------|------------------|---------|
| Emails send immediately | EMAIL_SCHEDULING_SETUP.md | Troubleshooting |
| Wrong timezone | EMAIL_TIMING_GUIDE.md | Timezone Handling |
| CRON not running | SUPABASE_CRON_SETUP.md | Problem 1 |
| SMTP errors | EMAIL_SCHEDULING_SETUP.md | Troubleshooting |
| Email never arrived | EMAIL_TIMING_GUIDE.md | Troubleshooting |

### Debug Checklist
- [ ] CRON job exists and active?
- [ ] SMTP_PASSWORD configured?
- [ ] Email in queue with 'pending' status?
- [ ] scheduled_for time is in the past?
- [ ] Recent CRON run succeeded?

---

## 🎓 Learning Path

**Beginner:**
1. EMAIL_QUICK_START.md
2. EMAIL_TIMING_GUIDE.md

**Intermediate:**
3. EMAIL_SCHEDULING_SETUP.md
4. SUPABASE_CRON_SETUP.md

**Advanced:**
5. EMAIL_SYSTEM_SUMMARY.md

---

## 📊 System Architecture (Quick Overview)

```
User Input → Frontend (React)
              ↓
        scheduledISO created
              ↓
Backend API (Hono) → Saves to email_queue
              ↓
        status: 'pending'
              ↓
CRON Job (every 5 mins) → Checks scheduled_for <= NOW()
              ↓
Email Processor → Sends via SMTP
              ↓
        status: 'sent'
```

---

## 🎉 Success Criteria

Your system is working if:
- ✅ CRON job shows `active: true`
- ✅ Test email arrives within 5-10 minutes
- ✅ Email content matches what you scheduled
- ✅ Email arrives at LOCAL time (not UTC)
- ✅ Emails work even when app is closed

---

## 📝 Document Version

- **Created:** April 10, 2026
- **Last Updated:** April 10, 2026
- **System Version:** Resilio v1.0
- **Backend:** Supabase Edge Functions (Hono)
- **CRON:** pg_cron + pg_net

---

**Start with EMAIL_QUICK_START.md and you'll be up and running in 5 minutes!** 🚀
