# 🔧 Troubleshooting Guide - Resilio

Quick solutions to common issues.

---

## 🚨 Common Issues & Solutions

### 1. WebAssembly / WASM Error

**Symptoms:**
- Error message: "WebAssembly.instantiate(): Compiling function failed"
- App crashes or won't load
- Console shows WASM-related errors

**Solution:**
✅ **Hard refresh your browser**
- Windows/Linux: Press `Ctrl + Shift + R`
- Mac: Press `Cmd + Shift + R`
- Or: Click the yellow "Clear Cache" banner at the top

**Why this happens:**
Your browser cached old code that included WebAssembly imports. This has been fixed in the current version.

**One-time fix:**
You only need to do this once. After the hard refresh, the error won't come back.

---

### 2. Can't Login / Authentication Error

**Symptoms:**
- "Invalid credentials" error
- Can't access account
- Session expires immediately

**Solution A - Check Credentials:**
```
✅ Email is correct (check for typos)
✅ Password is at least 6 characters
✅ Account was created (try "Forgot Password" if available)
```

**Solution B - Clear Session:**
```javascript
// Open browser console (F12) and run:
localStorage.clear();
// Then refresh the page
```

**Solution C - Sign Up Fresh:**
If all else fails, create a new account. Your data is isolated per user.

---

### 3. Email Notifications Not Received

**Symptoms:**
- Future messages not arriving
- Reminders not sending
- No email in inbox or spam

**Check 1 - SMTP Secrets:**
```
1. Go to Supabase Dashboard
2. Edge Functions → Secrets
3. Verify these exist:
   - SMTP_HOST = smtp.gmail.com
   - SMTP_PORT = 587
   - SMTP_USER = [Your Gmail]
   - SMTP_PASSWORD = [App Password]
   - SMTP_FROM = [Your Gmail]
```

**Check 2 - Cron Job:**
```
The scheduler needs to run regularly.
Option 1: Set up cron-job.org (recommended)
Option 2: Run /test-scheduler.html manually
Option 3: Set up system cron job
```

**Check 3 - Gmail App Password:**
```
1. Go to: https://myaccount.google.com/apppasswords
2. Verify App Password is: lidw vvvg opxc ygbz
3. Or generate a new one if needed
4. Update SMTP_PASSWORD secret in Supabase
```

**Check 4 - Check Logs:**
```
1. Go to Supabase Dashboard
2. Edge Functions → Logs
3. Look for:
   ❌ "SMTP credentials not configured"
   ❌ "Invalid login: 535-5.7.8"
   ❌ "Connection timeout"
```

**Common Log Errors:**

| Error Message | Solution |
|--------------|----------|
| "SMTP credentials not configured" | Add SMTP secrets in Supabase |
| "Invalid login: 535-5.7.8" | Re-generate Gmail App Password |
| "Connection timeout" | Check SMTP_HOST and SMTP_PORT |
| "No email found for user" | User's email not in auth system |

---

### 4. Profile Picture Not Showing

**Symptoms:**
- Uploaded image doesn't appear
- Shows initials instead

**Solution:**
```
1. Image must be under 5MB
2. Use JPG or PNG format
3. Clear cache (Ctrl+Shift+R)
4. Re-upload the image
5. Check browser console for errors
```

**If still not working:**
- Try a different image
- Try from a different browser
- Check Supabase storage limits

---

### 5. Data Not Loading / Empty Dashboard

**Symptoms:**
- Dashboard shows no stats
- Entries list is empty
- Recent activities not showing

**Solution A - Check Login:**
```
✅ You're logged in with the correct account
✅ Check user ID matches your data
✅ Try logging out and back in
```

**Solution B - Check Data:**
```
1. Go to Journal → Entries
2. If you see entries there, data exists
3. If not, you need to create some entries first
```

**Solution C - Clear Cache:**
```
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

### 6. Voice Typing Not Working

**Symptoms:**
- Microphone icon doesn't respond
- No text appears when speaking
- "Speech recognition not supported" message

**Solution:**
```
✅ Use Chrome, Edge, or Safari (Firefox may not work)
✅ Allow microphone permissions when prompted
✅ Check microphone is working in system settings
✅ Try speaking louder and clearer
✅ Make sure you clicked the mic icon first
```

**Browser Compatibility:**
- ✅ Chrome (recommended)
- ✅ Edge (recommended)
- ✅ Safari (works on iOS/Mac)
- ❌ Firefox (limited support)

---

### 7. Session Expired / Logged Out Unexpectedly

**Symptoms:**
- Redirected to login page
- "Session expired" message

**Solution:**
```
This is normal behavior for security.
Just login again - your data is safe!

To extend session:
- Stay active in the app
- Don't close browser for long periods
```

**Session Duration:**
- Active session: Unlimited while using
- Inactive: Expires after inactivity (Supabase default)

---

### 8. Scheduler Not Running Automatically

**Symptoms:**
- Emails only send when you manually test
- Future messages not arriving on time

**Solution - Set Up Cron Job:**

**Option A: cron-job.org (Easiest)**
```
1. Go to https://cron-job.org/
2. Sign up (free)
3. Create Cronjob:
   - Title: "Resilio Scheduler"
   - URL: https://[PROJECT_ID].supabase.co/functions/v1/make-server-40d4d8fd/scheduler/check
   - Schedule: Every 1 hour
4. Advanced tab → Add header:
   - Name: Authorization
   - Value: Bearer [YOUR_ANON_KEY]
5. Save and Enable
```

**Option B: System Cron (Linux/Mac)**
```bash
crontab -e

# Add this line:
0 * * * * curl -X GET "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/scheduler/check" -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Verify It's Working:**
```
Check Supabase Edge Function logs hourly.
You should see: "🔍 Checking for scheduled emails to send..."
```

---

### 9. Dashboard Streak Not Updating

**Symptoms:**
- Login streak stuck at same number
- Doesn't increase after daily login

**Solution:**
```
1. Make sure you're logging in once per day
2. Streak resets if you miss a day
3. Check that you're logged in with same account
4. Wait for dashboard to refresh (may take a moment)
```

**How Streaks Work:**
- Login today: Streak = 1
- Login tomorrow: Streak = 2
- Miss a day: Streak resets to 0
- Login is tracked once per day (not per session)

---

### 10. API Errors / 500 Internal Server Error

**Symptoms:**
- "Failed to fetch" errors
- API calls returning 500
- Features not saving

**Solution:**

**Step 1 - Check Server Status:**
```
1. Go to Supabase Dashboard
2. Edge Functions → Status
3. Make sure server is running
```

**Step 2 - Check Logs:**
```
1. Edge Functions → Logs
2. Look for error messages
3. Note the error details
```

**Step 3 - Common Fixes:**
```
✅ Hard refresh browser (Ctrl+Shift+R)
✅ Check internet connection
✅ Try again in a few minutes
✅ Verify Supabase project is not paused
```

---

## 🔍 Debugging Tools

### Browser Console (F12)
```javascript
// Check current user
console.log(localStorage.getItem('resilio_user_id'));
console.log(localStorage.getItem('resilio_user_name'));
console.log(localStorage.getItem('resilio_access_token'));

// Clear session (force logout)
localStorage.clear();

// Check cache status
console.log(localStorage.getItem('cache_cleared_v2'));
```

### Test Files
- `/test-scheduler.html` - Test email scheduler
- `/test-email-system.html` - Test SMTP
- `/test-server.html` - Test all endpoints
- `/debug-auth.html` - Debug authentication

### Supabase Dashboard
- Edge Functions → Logs (server errors)
- Authentication → Users (user accounts)
- Database → kv_store_40d4d8fd (data)
- Edge Functions → Secrets (environment variables)

---

## 📞 Where to Get Help

### Check Documentation:
1. `/README.md` - Overview
2. `/QUICK_START_GUIDE.md` - User guide
3. `/SYSTEM_STATUS.md` - System architecture
4. `/SMTP_SETUP_COMPLETE.md` - Email setup
5. `/PROJECT_FIXED_AND_READY.md` - Complete docs

### Check Logs:
1. **Browser Console** (F12) - Frontend errors
2. **Supabase Logs** (Dashboard → Edge Functions → Logs) - Backend errors

### Common Error Messages:

| Message | Location | Solution |
|---------|----------|----------|
| "WebAssembly" error | Browser | Hard refresh (Ctrl+Shift+R) |
| "Invalid credentials" | Login | Check email/password |
| "SMTP not configured" | Server logs | Add SMTP secrets |
| "Unauthorized" | API call | Check access token |
| "Session expired" | App | Login again |
| "Failed to fetch" | Network | Check connection |

---

## ✅ Quick Diagnostic Checklist

Run through this if you're having issues:

```
□ Hard refresh (Ctrl+Shift+R) - Fixes 90% of issues
□ Check browser console for errors (F12)
□ Verify you're logged in with correct account
□ Check internet connection
□ Try different browser (Chrome recommended)
□ Check Supabase Edge Function logs
□ Verify SMTP secrets are configured
□ Clear localStorage and re-login
□ Try test files to isolate the issue
```

---

## 🚀 Still Having Issues?

If none of the above solutions work:

1. **Document the Issue:**
   - What were you trying to do?
   - What happened instead?
   - Any error messages? (screenshot helpful)
   - Which browser and OS?

2. **Check Logs:**
   - Browser console (F12 → Console tab)
   - Supabase logs (Dashboard → Edge Functions → Logs)
   - Copy any error messages

3. **Try Basic Troubleshooting:**
   - Hard refresh (Ctrl+Shift+R)
   - Different browser
   - Incognito/Private mode
   - Different device

4. **Review Documentation:**
   - Check if issue is mentioned in docs
   - Review system status
   - Check feature is implemented

---

## 💡 Prevention Tips

### To avoid issues:

1. **Regular Cache Clearing:**
   - Hard refresh weekly (Ctrl+Shift+R)
   - Or when you notice odd behavior

2. **Keep Session Active:**
   - Use the app regularly
   - Re-login if away for long periods

3. **Monitor Email Scheduler:**
   - Check cron job is running
   - Review logs occasionally
   - Test with near-future messages

4. **Browser Best Practices:**
   - Use Chrome or Edge (best compatibility)
   - Allow microphone for voice typing
   - Enable notifications for reminders

5. **Data Backup:**
   - Export important entries periodically
   - Keep copy of important messages

---

## 📊 System Health Check

Run this checklist monthly:

```
□ Login works smoothly
□ Dashboard shows correct streak
□ Journal entries save and load
□ Voice typing works
□ Profile picture displays
□ Email scheduler is running (check cron)
□ Test a reminder for today (verify email sent)
□ Check Supabase logs for errors
□ Verify SMTP secrets still valid
□ Test on mobile device
```

---

**Last Updated:** December 6, 2025  
**Status:** All known issues documented and solvable

For more help, check `/QUICK_START_GUIDE.md` or `/SYSTEM_STATUS.md`
