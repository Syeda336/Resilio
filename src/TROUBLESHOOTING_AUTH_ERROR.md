# 🔧 Troubleshooting: "Error scheduling message"

## 🐛 The Error

```
❌ Error scheduling message: Error
```

This generic error happens when creating Future Messages or Reminders fails.

---

## 📊 Diagnosis Steps

### Step 1: Use the Debug Tool

I've created a debug tool to help diagnose the issue:

**Open this file in your browser:**
```
/debug-auth.html
```

Or navigate to:
```
http://localhost:PORT/debug-auth.html
```

The debug tool will:
1. ✅ Check if you have an access token stored
2. ✅ Test creating a future message
3. ✅ Test creating a reminder
4. ✅ Validate your access token
5. ✅ Help you clear and reset tokens

---

## 🔍 Common Causes & Solutions

### Cause 1: Not Logged In ⚠️

**Symptom:** No access token in localStorage

**Solution:**
1. Make sure you're logged into Resilio
2. If you see the welcome screen, click "Sign In" or "Sign Up"
3. Enter your credentials and log in
4. Try creating a reminder/message again

---

### Cause 2: Expired Token 🕐

**Symptom:** Token exists but API calls fail with 401

**Solution:**
1. Log out of Resilio
2. Log back in
3. This will refresh your access token
4. Try again

---

### Cause 3: Backend Not Running 🖥️

**Symptom:** Network errors or 500 status codes

**Solution:**
1. Check if your Supabase Edge Functions are deployed
2. Make sure the backend server is running
3. Check Supabase Dashboard → Functions → Logs

---

### Cause 4: Missing User ID Association 🆔

**Symptom:** Authentication succeeds but data isn't saved

**Solution:**
1. The backend now requires a valid user session
2. Log out and log back in to ensure proper session
3. Check browser console for detailed error messages

---

## 🧪 Testing With Browser Console

Open your browser's Developer Tools (F12) and check:

### 1. Check Access Token
```javascript
console.log('Access Token:', localStorage.getItem('resilio_access_token'));
```

**Expected:** A long JWT string starting with `eyJ...`
**If null:** You're not logged in

### 2. Check Headers
Look for these console messages when creating a reminder:
```
🔑 Access token present: true eyJhbGciOiJIUzI1NiIs...
Creating reminder with headers: {...}
```

### 3. Check Server Response
Look for error messages like:
```
❌ Reminder creation failed: 401 {...}
❌ Error creating reminder: Error: Server error 401: ...
```

---

## 🔄 Quick Fix: Logout & Login

The fastest way to fix most auth issues:

1. **In Resilio App:**
   - Click your profile icon (top right)
   - Click "Log Out"
   
2. **Log Back In:**
   - Click "Sign In"
   - Enter your email and password
   - Click "Sign In"

3. **Try Again:**
   - Go to Journal → Reminders or Future Self Messages
   - Create a new item
   - Should work now! ✅

---

## 📝 What I Fixed

I've already made these improvements to help debug:

### 1. Enhanced API Error Logging (`/utils/api.tsx`)

```typescript
// Now logs detailed error information
console.log('🔑 Access token present:', !!accessToken);
console.log('Creating future message with headers:', getHeaders());
console.error('❌ Future message creation failed:', response.status, text);
```

### 2. Better Backend Error Messages

```typescript
// Backend now returns detailed error messages
return c.json({ 
  error: `Authentication failed: ${authError.message}` 
}, 401);
```

### 3. Debug Tool (`/debug-auth.html`)

- Check stored tokens
- Test API calls
- Validate tokens
- Clear storage

---

## 📋 Checklist

Before reporting an issue, please check:

- [ ] I am logged into Resilio
- [ ] I can see my profile name in the top right
- [ ] I have tried logging out and back in
- [ ] I have checked the browser console (F12) for errors
- [ ] I have run the debug tool (`/debug-auth.html`)
- [ ] I have checked if the access token exists in localStorage

---

## 🎯 Most Likely Solution

**90% of auth errors are fixed by:**

1. **Log out of Resilio**
2. **Log back in**
3. **Try creating a reminder/message again**

This refreshes your access token and ensures proper authentication!

---

## 📞 Still Having Issues?

If you've tried everything above, please provide:

1. **Console Output:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Copy any error messages you see

2. **Debug Tool Results:**
   - Run `/debug-auth.html`
   - Take screenshot of results

3. **What You're Trying:**
   - Creating a reminder? Future message?
   - What date/time are you setting?

This will help diagnose the issue faster!

---

## 🚀 Next Steps

Once auth is working:

1. ✅ Test creating reminders
2. ✅ Test creating future messages
3. ✅ Set up SMTP for email notifications
4. ✅ Set up cron job for automated sending

See:
- `/QUICK_START_EMAIL.md` - SMTP setup
- `/SMTP_EMAIL_SETUP_GUIDE.md` - Detailed guide
- `/test-email-system.html` - Email testing tool

---

**Let's get your auth working!** 🎉
