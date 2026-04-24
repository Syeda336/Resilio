# ⚡ Quick Fix Reference - Email Timing

## 🎯 Problem
Email 6:40 PM ke liye schedule kiya → Internet down → Internet 7:19 PM pe back → Email 7:20 PM pe send hua ❌

## ✅ Solution
10-minute delivery window - emails sirf scheduled time ke ±10 minutes mein send honge

---

## 📋 Deploy Checklist

### ☐ Step 1: Deploy Function (1 min)
```bash
deploy.bat
# OR
./deploy.sh
```

### ☐ Step 2: Run SQL (1 min)
Supabase → SQL Editor → Paste → Run:
```sql
COMMENT ON COLUMN email_queue.status IS 'Email status: pending, processing, sent, failed, or missed';

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_queue_status_check') THEN
    ALTER TABLE email_queue
    ADD CONSTRAINT email_queue_status_check 
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'missed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_queue_missed ON email_queue(scheduled_for) WHERE status = 'missed';
```

### ☐ Step 3: Verify (30 sec)
```sql
SELECT * FROM cron.job WHERE jobname = 'resilio-email-scheduler';
```

---

## 📊 Email Statuses

| Status | Kya Hota Hai |
|--------|--------------|
| `pending` | Wait kar raha hai |
| `processing` | Bheja ja raha hai |
| `sent` | ✅ Bhej diya (on time) |
| `failed` | ❌ Error (retry hoga) |
| `missed` | ⏰ Time nikal gaya (NOT sent) |

---

## 🧪 Quick Test

```sql
-- Schedule email 2 min baad
-- Wait 15 min (let it expire)
-- Check:
SELECT email_type, scheduled_for, status 
FROM email_queue 
ORDER BY created_at DESC 
LIMIT 5;
-- Expected: status = 'missed'
```

---

## 🔧 Configuration

### Change Time Window (Default: 10 min)
`/supabase/functions/server/email_processor.tsx` → Line 21:
```typescript
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
//                                                 ^^ change this
```

### Change CRON Frequency (Default: 5 min)
```sql
SELECT cron.unschedule('resilio-email-scheduler');
SELECT cron.schedule('resilio-email-scheduler', '*/2 * * * *', $$ ... $$);
--                                               ^^^ every 2 min
```

---

## 📈 Monitoring

### Missed Emails
```sql
SELECT COUNT(*) FROM email_queue WHERE status = 'missed';
```

### Today's Activity
```sql
SELECT status, COUNT(*) 
FROM email_queue 
WHERE created_at::date = CURRENT_DATE 
GROUP BY status;
```

### CRON Logs
```sql
SELECT start_time, status 
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 5;
```

---

## 🚨 Troubleshooting

| Problem | Fix |
|---------|-----|
| Still sending late | Re-deploy: `npx supabase functions deploy make-server-40d4d8fd` |
| Migration failed | Run simple index only (see `/EMAIL_TIMING_FIX.md`) |
| CRON not running | Check `/SUPABASE_CRON_SETUP.sql` |

---

## 📖 Full Docs

- **Technical Details**: `/EMAIL_TIMING_FIX.md`
- **Deployment Guide**: `/DEPLOY_EMAIL_FIX_NOW.md`
- **Hindi Summary**: `/EMAIL_FIX_SUMMARY.md`
- **This Card**: `/QUICK_FIX_REFERENCE.md`

---

## ✨ Result

**Before**: Email late send ho raha tha ❌  
**After**: Email sirf scheduled time pe (±10 min) send hoga ✅  
**Beyond Window**: Email 'missed' mark hoga, send NAHI hoga ✅

---

**Status**: 🟢 Ready to Deploy
