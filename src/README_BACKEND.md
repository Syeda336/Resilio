# 📧 Resilio Backend - Automatic Email Scheduler

## 🎯 What This Does

Automatically sends emails at scheduled time for:
- ✉️ Future Self Messages
- ⏰ Personal Reminders  
- 🍎 Food Database notifications
- 🍽️ Meal Planner reminders

**Works 24/7 without app being open!**

---

## 🚀 Quick Start

### 1. Deploy (15 minutes)

Follow: **[DEPLOY_NOW_CHECKLIST.md](./DEPLOY_NOW_CHECKLIST.md)**

**Summary:**
1. Deploy Edge Functions (`deploy.bat` or `deploy.sh`)
2. Configure SMTP secrets in Supabase
3. Setup CRON job in database
4. Test with sample email

### 2. Verify

```sql
-- Check CRON is active
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';
-- Result: active = true ✅

-- Check recent runs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
-- Result: Runs every 5 minutes ✅
```

### 3. Use

**That's it!** Just schedule emails in your app:
- Future Self → Schedule message
- Reminders → Create reminder
- Diet Plan → Schedule food
- Meal Planner → Schedule meal

Emails will send automatically! 🎉

---

## 📚 Documentation

| File | What's Inside | For Who |
|------|---------------|---------|
| **[DEPLOY_NOW_CHECKLIST.md](./DEPLOY_NOW_CHECKLIST.md)** | ⚡ 15-min deployment | **Start here!** |
| [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md) | 📖 Detailed deployment | Need help? |
| [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) | 🏗️ System design | Developers |
| [EMAIL_WORKS_WITHOUT_APP.md](./EMAIL_WORKS_WITHOUT_APP.md) | 💡 How it works 24/7 | Curious users |
| [VERIFY_CRON_WORKING.md](./VERIFY_CRON_WORKING.md) | 🔍 Verification queries | Testing |
| [FINAL_EMAIL_FIX_SUMMARY.md](./FINAL_EMAIL_FIX_SUMMARY.md) | ✅ Complete summary | Overview |

---

## 🏗️ Architecture Overview

```
User schedules email in app
         ↓
Saved to database (email_queue)
         ↓
CRON job checks every 5 minutes
         ↓
Edge Function sends via SMTP
         ↓
Email delivered to inbox ✅
```

**Key Point:** Everything runs on Supabase servers, not your computer!

---

## ✅ What's Already Done

All code is ready! You just need to deploy:

- ✅ Edge Functions written
- ✅ Database schema created  
- ✅ Email templates designed
- ✅ CRON job SQL ready
- ✅ Security implemented
- ✅ Error handling added

**Total files:**
- `/supabase/functions/server/email_processor.tsx`
- `/supabase/functions/server/email_nodemailer.tsx`
- `/SUPABASE_CRON_SETUP.sql`

---

## 🔧 Requirements

**Supabase Account:**
- Free tier works! ✅
- Need project ID
- Need API keys

**SMTP Email:**
- Gmail (recommended)
- Or Outlook/Yahoo/any SMTP
- App password required

**That's it!** No external services needed.

---

## 🧪 Testing

**Quick test:**
1. Schedule email for 5 minutes from now
2. Wait 10 minutes
3. Check inbox - email should arrive ✅

**Advanced test:**
1. Schedule email
2. Close browser
3. Shut down computer
4. Wait for scheduled time
5. Check email on phone - should arrive ✅

**This proves:** System works without app! 🎉

---

## 📊 Monitoring

### Daily Check

```sql
SELECT 
  status,
  COUNT(*) as count
FROM email_queue
WHERE created_at::date = CURRENT_DATE
GROUP BY status;
```

**Healthy system:**
- pending: 0 (or emails scheduled for future)
- sent: > 0 ✅
- failed: 0 ✅

### Performance Check

```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (sent_at - scheduled_for))/60) as avg_delay_minutes
FROM email_queue
WHERE status = 'sent'
AND sent_at > NOW() - INTERVAL '7 days';
```

**Good performance:**
- avg_delay_minutes: 2-5 minutes ✅

---

## 🚨 Troubleshooting

### Emails not sending?

**Check list:**
1. ✅ CRON job active?
2. ✅ Edge Function deployed?
3. ✅ SMTP secrets configured?
4. ✅ Email in queue (pending status)?

**Quick fix:**
```sql
-- Force trigger email processor
SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
);
```

### CRON not running?

```sql
-- Check if extension enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- If not found, enable it
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

**Still stuck?** See [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md#troubleshooting)

---

## ⚙️ Configuration

### CRON Frequency

**Current:** Every 5 minutes (`*/5 * * * *`)

**Change to 1 minute:**
```sql
SELECT cron.unschedule('resilio-email-scheduler');
SELECT cron.schedule('resilio-email-scheduler', '* * * * *', $$...$$);
```

### Email Retention

**Current:** Keep all emails forever

**Auto-cleanup (90 days):**
```sql
-- Create scheduled cleanup
SELECT cron.schedule(
    'cleanup-old-emails',
    '0 0 * * *', -- Daily at midnight
    $$
    DELETE FROM email_queue 
    WHERE status = 'sent' 
    AND sent_at < NOW() - INTERVAL '90 days';
    $$
);
```

---

## 🔐 Security

### SMTP Credentials
- Stored in Supabase Edge Function Secrets
- Never exposed to frontend
- Encrypted at rest

### API Protection
- CRON endpoint requires API key
- Invalid key = 401 Unauthorized

### Database Security
- Row Level Security (RLS) enabled
- Users can only see own emails
- Supabase Auth integration

---

## 📈 Scalability

**Current capacity:**
- 50 emails per CRON run
- 288 CRON runs per day (every 5 min)
- **= 14,400 emails per day** ✅

**Increase capacity:**
```typescript
// In email_processor.tsx
.limit(100) // From 50 to 100

// New capacity: 28,800 emails per day
```

**Increase frequency:**
```sql
-- Every 1 minute instead of 5
-- Capacity: 72,000 emails per day
```

---

## 💡 Features

### Multiple Email Types

| Type | Trigger | Template |
|------|---------|----------|
| Future Message | Future Self section | `sendFutureMessageEmail()` |
| Reminder | Reminders section | `sendReminderEmail()` |
| Diet | Food Database | `sendDietEmail()` |
| Meal | Meal Planner | `sendMealEmail()` |

### Automatic Retry

```typescript
// Email fails?
// - Status: failed
// - retry_count: incremented
// - Will retry next CRON run (if retry_count < 3)
```

### Error Tracking

```typescript
// Failed emails store error message
error_message: "SMTP authentication failed"

// Query failed emails:
SELECT * FROM email_queue WHERE status = 'failed';
```

---

## 🎯 Best Practices

### For Users

1. **Schedule early** - Give system time to process
2. **Check spam** - First email might go to spam
3. **Whitelist sender** - Add your sender email to contacts

### For Developers

1. **Monitor queue** - Watch for stuck emails
2. **Check CRON logs** - Verify regular runs
3. **Test SMTP** - Ensure credentials valid
4. **Set up alerts** - Notify on failures

### For Admins

1. **Regular backups** - Database snapshots
2. **Log rotation** - Clean old logs
3. **Performance monitoring** - Track delays
4. **Capacity planning** - Scale before limits

---

## 🔄 Update Checklist

**After code changes:**

1. Deploy Edge Functions:
   ```bash
   deploy.bat  # or deploy.sh
   ```

2. Verify deployment:
   ```
   Supabase Dashboard → Edge Functions
   Check: make-server-40d4d8fd (Deployed)
   ```

3. Test manually:
   ```bash
   curl -X POST '[edge-function-url]'
   ```

4. Monitor next CRON run:
   ```sql
   SELECT * FROM cron.job_run_details 
   ORDER BY start_time DESC LIMIT 1;
   ```

---

## 📞 Support

**Issues?**
1. Check [Troubleshooting](#troubleshooting)
2. Review [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md)
3. Verify [CRON is working](./VERIFY_CRON_WORKING.md)

**Questions?**
- Architecture: [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)
- How it works: [EMAIL_WORKS_WITHOUT_APP.md](./EMAIL_WORKS_WITHOUT_APP.md)

---

## 🎉 Success Metrics

**System is healthy if:**

✅ CRON job active  
✅ Runs every 5 minutes  
✅ Emails sending (status = sent)  
✅ No stuck emails (pending > 10 min)  
✅ Low error rate (< 1%)  
✅ Fast delivery (< 5 min delay)  

**Check with:**
```sql
SELECT 
  (SELECT active FROM cron.job WHERE jobname = 'resilio-email-scheduler') as cron_active,
  (SELECT COUNT(*) FROM cron.job_run_details WHERE start_time > NOW() - INTERVAL '30 min') as recent_runs,
  (SELECT COUNT(*) FROM email_queue WHERE status = 'pending' AND scheduled_for < NOW() - INTERVAL '10 min') as stuck_emails,
  (SELECT COUNT(*) FROM email_queue WHERE status = 'sent' AND sent_at::date = CURRENT_DATE) as sent_today;
```

---

## 📝 Summary

**What you have:**
- ✅ Complete email scheduling system
- ✅ Automatic delivery at scheduled time
- ✅ Works 24/7 without app
- ✅ Production-ready code

**What you need to do:**
- Deploy Edge Functions (5 min)
- Configure SMTP (3 min)
- Setup CRON job (2 min)
- Test (5 min)

**Total time:** 15 minutes

**Result:** Fully automated email system! 🚀

---

**Quick Links:**
- 🚀 [Deploy Now](./DEPLOY_NOW_CHECKLIST.md)
- 📖 [Full Guide](./BACKEND_DEPLOYMENT_GUIDE.md)
- 🏗️ [Architecture](./BACKEND_ARCHITECTURE.md)
- 🔍 [Verify](./VERIFY_CRON_WORKING.md)

**Status:** ✅ Ready to Deploy  
**Difficulty:** Easy  
**Maintenance:** Low
