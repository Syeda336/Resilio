# 🧪 QUICK TEST CHECKLIST - Email Queue System

## ⚡ Pre-Testing Setup (1 minute)

1. **Login to Resilio**
   - Make sure you're logged in
   - Check token exists: Open browser console (F12), run:
     ```javascript
     localStorage.getItem('resilio_access_token')
     ```
   - Should return a long string (JWT token)

2. **Open Required Tabs**
   - ✅ Resilio app (where you'll test)
   - ✅ Browser Console (F12)
   - ✅ Supabase Dashboard → Edge Functions → server → Logs
   - ✅ Supabase Dashboard → Table Editor → `email_queue`

3. **Note Current Time**
   - Current time: ___:___ (e.g., 2:00 PM)
   - Test time: ___:___ (current time + 3 minutes)

---

## 🎯 Test 1: Future Self Messaging (3 minutes)

**Steps:**
1. Go to **Future Self Messaging** section
2. Enter your email: ________________
3. Write message: "Test 1 - Future Self"
4. Set Date: **Today**
5. Set Time: **[Current time + 3 minutes]**
6. Click **"Schedule Message"**

**Check Browser Console:**
```
✅ Expected: "📧 [FutureSelf] Scheduling message"
✅ Expected: "✅ [FutureSelf] Backend response"
```

**Check Supabase Logs:**
```
✅ Expected: "🔐 User authenticated"
✅ Expected: "📅 Scheduling future message email"
✅ Expected: "✅ Future message email queued"
```

**Check `email_queue` Table:**
```sql
SELECT * FROM email_queue 
WHERE email_type = 'future_message' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Result:**
- ✅ New row appears
- ✅ `status` = 'pending'
- ✅ `scheduled_for` matches your selected time
- ✅ `user_email` is correct

**Wait 3 Minutes:**
- ✅ Email arrives in inbox
- ✅ Status changes to 'sent'

**Result:** ⭐ PASS / ❌ FAIL

**If FAIL, error message:** _______________________

---

## 🎯 Test 2: Personal Reminders (3 minutes)

**Steps:**
1. Go to **Personal Reminders** section
2. Enter your email: ________________
3. Task: "Test 2 - Reminder"
4. Set Date: **Today**
5. Set Time: **[Current time + 3 minutes]**
6. Click **"Add Reminder"**

**Check Browser Console:**
```
✅ Expected: "📧 [PersonalReminders] Creating reminder"
✅ Expected: "✅ [PersonalReminders] Backend response"
```

**Check Supabase Logs:**
```
✅ Expected: "🔐 User authenticated"
✅ Expected: "📅 Scheduling reminder email"
✅ Expected: "✅ Reminder email queued"
```

**Check `email_queue` Table:**
```sql
SELECT * FROM email_queue 
WHERE email_type = 'reminder' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Result:**
- ✅ New row appears
- ✅ Subject starts with "⏰"
- ✅ Message content has your task

**Wait 3 Minutes:**
- ✅ Email arrives

**Result:** ⭐ PASS / ❌ FAIL

---

## 🎯 Test 3: Food Database (3 minutes)

**Steps:**
1. Go to **Diet Plan** → **Food Database** tab
2. Search: "Chicken"
3. Select **2-3 food items** (check the checkboxes)
4. Scroll to top, you'll see "X items selected"
5. Click **"Add Selected Items to Plan"**
6. Set Date: **Today**
7. Set Time: **[Current time + 3 minutes]**
8. Click **"Add to Plan"**

**Check Browser Console:**
```
✅ Expected: "🍽️ [FoodDatabase] Saving diet item with email scheduling"
✅ Expected: "✅ [FoodDatabase] Backend response"
✅ Expected: "   emailQueued: true"
✅ Expected: "📧 ✅ Email successfully queued for scheduled delivery!"
```

**Check Supabase Logs:**
```
✅ Expected: "🔍 [EMAIL DEBUG] Checking email queueing conditions"
✅ Expected: "✅ [EMAIL DEBUG] All conditions met"
✅ Expected: "📦 [EMAIL DEBUG] Importing email_queue module"
✅ Expected: "✅ [EMAIL DEBUG] email_queue module imported successfully!"
✅ Expected: "🚀 [EMAIL DEBUG] CALLING enqueueEmail NOW..."
✅ Expected: "✅ Diet reminder email queued successfully!"
```

**Check `email_queue` Table:**
```sql
SELECT * FROM email_queue 
WHERE email_type = 'diet_plan' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Result:**
- ✅ New row appears
- ✅ Subject starts with "🍽️"
- ✅ Message content has food names

**Wait 3 Minutes:**
- ✅ Email arrives

**Result:** ⭐ PASS / ❌ FAIL

---

## 🎯 Test 4: Meal Planner (3 minutes)

**Steps:**
1. Go to **Diet Plan** → **Meal Planner** tab
2. Click **"Breakfast"** button
3. Description: "Test 4 - Breakfast"
4. Items: "Oatmeal, Fruits"
5. Set Date: **Today**
6. Time is auto-filled to 08:00, change it to: **[Current time + 3 minutes]**
7. Click **"Save Meal Plan"**

**Check Browser Console:**
```
✅ Expected: "📝 [MealPlanner] Saving meal plan"
✅ Expected: "✅ [MealPlanner] Backend response"
✅ Expected: "   emailQueued: true"
```

**Check Supabase Logs:**
```
✅ Expected: Same as Food Database test
```

**Check `email_queue` Table:**
```sql
SELECT * FROM email_queue 
WHERE email_type = 'diet_plan' 
AND metadata->>'mealType' = 'Breakfast'
ORDER BY created_at DESC 
LIMIT 1;
```

**Wait 3 Minutes:**
- ✅ Email arrives

**Result:** ⭐ PASS / ❌ FAIL

---

## 🎯 Test 5: Email Queue Debugger (1 minute)

**Steps:**
1. Go to **Profile** page (click profile icon in navigation)
2. Click **"Email Queue Debugger"** tab
3. You should see all 4 scheduled emails

**Check Display:**
```
✅ Expected: 4 emails shown
✅ Expected: All have status "⏳ Pending"
✅ Expected: Correct scheduled times
✅ Expected: Correct email types
```

**After 3 minutes (when emails are sent):**
1. Click **"Refresh"** button
2. Check status updates:
```
✅ Expected: All emails now show "✅ Sent"
✅ Expected: "Sent At" timestamp is filled
```

**Result:** ⭐ PASS / ❌ FAIL

---

## 📊 Overall Results

| Test | Result | Notes |
|------|--------|-------|
| Future Self Messaging | ⭐ PASS / ❌ FAIL | |
| Personal Reminders | ⭐ PASS / ❌ FAIL | |
| Food Database | ⭐ PASS / ❌ FAIL | |
| Meal Planner | ⭐ PASS / ❌ FAIL | |
| Email Queue Debugger | ⭐ PASS / ❌ FAIL | |

**Total Passed:** _____ / 5

---

## 🚨 If Any Test FAILS

### Error 1: "No access token provided"

**Solution:**
1. Logout completely
2. Login again
3. Retry the test

---

### Error 2: "Email was NOT scheduled" alert

**Check Browser Console:**
```javascript
// Look for this log:
🔍 [EMAIL DEBUG] Checking email queueing conditions: {
  hasScheduledTime: ???,
  hasUser: ???,
  hasUserEmail: ???
}
```

**If `hasUser: false`:**
→ Logout and login again

**If `hasScheduledTime: false`:**
→ Make sure you selected BOTH date and time

**If `hasUserEmail: false`:**
→ Check if email field is filled

---

### Error 3: Email queued but NOT in Email Queue Debugger

**Solution:**
```sql
-- Run in Supabase SQL Editor
ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;
```

Then refresh the Email Queue Debugger.

---

### Error 4: Emails in queue but NOT being sent

**Check Scheduler:**
1. Supabase Dashboard → Edge Functions → server → Logs
2. Look for: `"🔍 Checking for emails to send..."`

**If NOT found:**
→ Scheduler is not running

**Manual trigger:**
```bash
curl -X GET "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-40d4d8fd/scheduler/check"
```

---

## 📝 Notes & Observations

Write any issues, errors, or observations here:

_________________________________________

_________________________________________

_________________________________________

_________________________________________

---

## ✅ Sign-off

**Tested by:** ________________

**Date:** ________________

**Time:** ________________

**All tests passed:** ✅ YES / ❌ NO

**Ready for production:** ✅ YES / ❌ NO

---

**If all tests pass, you're done! 🎉**

**If any test fails, share this checklist with the error details and I'll help you fix it immediately! 🚀**
