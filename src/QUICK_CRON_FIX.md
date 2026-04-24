# ⚡ Quick Fix: External Cron Job 401 Error

## 🔴 Problem: Getting "401 Unauthorized"

Your external cron job is missing the authentication key!

---

## ✅ **Quick Solution (5 Minutes):**

### **Option 1: Use Query Parameter (Easiest!)**

Replace your cron job URL with this:

```
https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_CRON_API_KEY
```

**Where to get YOUR_CRON_API_KEY:**

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your project:** jcbtczjhqdyuoyctjcbl
3. **Click "Edge Functions"** in left sidebar
4. **Click on "make-server-40d4d8fd"**
5. **Click "Settings" tab**
6. **Scroll down to "Secrets"**
7. **Find "CRON_API_KEY"**
8. **Copy the value**
9. **Replace `YOUR_CRON_API_KEY` in URL above**

---

### **Option 2: Use Header (More Secure)**

**URL:**
```
https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails
```

**Add Custom Header:**
```
X-Cron-API-Key: YOUR_CRON_API_KEY
```

(Same steps above to get the key)

---

## 🆘 **If CRON_API_KEY Doesn't Exist:**

### **Create One Now:**

1. **Go to:** Supabase Dashboard → Edge Functions → make-server-40d4d8fd → Settings → Secrets
2. **Click:** "Add new secret"
3. **Name:** `CRON_API_KEY`
4. **Value:** Create a secure random string, example:
   ```
   resilio-external-cron-2026-secure-key-xyz789
   ```
5. **Click:** "Save"
6. **Wait 30 seconds** for deployment
7. **Copy that value** and use it in your cron job

---

## 🧪 **Test Your Setup:**

### **Method 1: Direct Test (Replace YOUR_KEY)**

Open this URL in browser:
```
https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY
```

**✅ Success Response:**
```json
{
  "success": true,
  "results": {
    "queueProcessed": 0,
    "queueSent": 0,
    "queueFailed": 0
  }
}
```

**❌ Fail Response (Wrong Key):**
```json
{
  "success": false,
  "error": "Unauthorized. Please login or provide valid CRON_API_KEY."
}
```

---

### **Method 2: curl Test**

```bash
curl "https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY"
```

---

## 📋 **Example Setup for Different Services:**

### **cron-job.org:**

1. **URL:**
   ```
   https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY
   ```

2. **Title:** Resilio Email Scheduler

3. **Schedule:** 
   - Every 5 minutes: `*/5 * * * *`
   - Or select "Every 5 minutes" from dropdown

4. **Request Method:** GET

5. **Save & Enable**

---

### **EasyCron:**

1. **Cron Job URL:**
   ```
   https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=YOUR_KEY
   ```

2. **Cron Name:** Resilio Email Queue

3. **Cron Expression:** `*/5 * * * *`

4. **HTTP Method:** GET

5. **Create Cron Job**

---

## 🎯 **Expected Behavior:**

### **When No Emails Due:**
```json
{
  "success": true,
  "results": {
    "queueProcessed": 0,
    "queueSent": 0,
    "queueFailed": 0,
    "retriedEmails": 0,
    "message": "No pending emails"
  },
  "timestamp": "2026-03-15T14:30:00.000Z"
}
```

### **When Emails Are Sent:**
```json
{
  "success": true,
  "results": {
    "queueProcessed": 3,
    "queueSent": 3,
    "queueFailed": 0,
    "retriedEmails": 0,
    "message": "Processed 3 emails"
  },
  "timestamp": "2026-03-15T14:30:00.000Z"
}
```

---

## 🔍 **Verify It's Working:**

### **Check Supabase Logs:**

1. **Go to:** Supabase Dashboard → Edge Functions → make-server-40d4d8fd
2. **Click:** "Logs" tab
3. **Look for every 5 minutes:**
   ```
   🔐 Auth Check - Received headers:
      X-Cron-API-Key: "YOUR_KEY"
   ✅ External cron authenticated
   🔄 Processing pending emails...
   ⏰ Current time: 2026-03-15T14:30:00.000Z
   ✅ No pending emails to process
   ```

---

## ⚠️ **Important Notes:**

1. **Don't share your CRON_API_KEY publicly!**
2. **Keep it secret like a password**
3. **You can change it anytime** in Supabase secrets
4. **If you change it**, update your cron job URL
5. **Frontend polling still works** without this (uses different auth)

---

## 🚀 **Final Checklist:**

- [ ] Got CRON_API_KEY from Supabase (or created one)
- [ ] Updated cron job URL with `?api_key=YOUR_KEY`
- [ ] Tested URL in browser (got success response)
- [ ] Cron job schedule set to every 5 minutes
- [ ] Test run successful (no 401 error)
- [ ] Checked Supabase logs (seeing cron triggers)

---

## 🎉 **Done!**

Your external cron job should now work! Emails will be processed every 5 minutes automatically, even when no users are online.

---

**Still Getting 401?**

Double-check:
1. CRON_API_KEY is exactly copied (no extra spaces)
2. URL includes `?api_key=` at the end
3. Supabase Edge Function has been redeployed (wait 30 sec after adding secret)
4. Check Supabase logs for exact error message

---

**Need More Help?**

Check the detailed guide: `/EXTERNAL_CRON_SETUP.md`
