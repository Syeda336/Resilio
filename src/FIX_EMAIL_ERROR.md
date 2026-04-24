# 🔧 FIX EMAIL ERROR: Invalid Login 535-5.7.8

## ❌ Error You're Seeing:

```
Email failed: Invalid login: 535-5.7.8
Username and Password not accepted
```

---

## ✅ Quick Fix (5 Minutes):

### Step 1: Get Gmail App Password

1. **Go to:** https://myaccount.google.com/apppasswords
   - If link doesn't work, you need to enable 2-Step Verification first

2. **Enable 2-Step Verification** (if not already):
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" → "Get Started"
   - Follow the steps to set it up

3. **Generate App Password:**
   - Go back to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" → Type "Resilio"
   - Click "Generate"
   - **COPY THE 16-CHARACTER PASSWORD** (e.g., `abcd efgh ijkl mnop`)

4. **Remove spaces from password:**
   - Original: `abcd efgh ijkl mnop`
   - Use this: `abcdefghijklmnop` ← No spaces!

---

### Step 2: Update Supabase Secrets

1. **Go to:** https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/settings/functions

2. **Scroll down to "Edge Function Secrets"**

3. **Click "Add New Secret" or edit existing ones:**

   **Set these 5 secrets:**

   ```
   Name: SMTP_HOST
   Value: smtp.gmail.com
   ```

   ```
   Name: SMTP_PORT
   Value: 587
   ```

   ```
   Name: SMTP_USER
   Value: your@gmail.com    ← Your actual Gmail address
   ```

   ```
   Name: SMTP_PASSWORD
   Value: abcdefghijklmnop  ← App Password WITHOUT spaces
   ```

   ```
   Name: SMTP_FROM
   Value: your@gmail.com    ← Same as SMTP_USER
   ```

4. **Click "Save" after each secret**

---

### Step 3: Restart Edge Function

**You MUST restart for secrets to take effect!**

**Option A: Dashboard**
- Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/functions
- Find `make-server-40d4d8fd`
- Click the three dots (⋮)
- Click "Restart" or "Redeploy"

**Option B: CLI** (if installed)
```bash
supabase functions deploy make-server-40d4d8fd
```

---

### Step 4: Test Email

1. Open your Resilio app
2. Go to "Future Self Messaging"
3. Schedule a test message
4. You should see: ✅ "Message scheduled" (green checkmark)
5. Check your email inbox!

---

## 🐛 Troubleshooting:

### Issue: "The setting you are looking for is not available"

**Solution:** Enable 2-Step Verification first
- https://myaccount.google.com/security
- Enable "2-Step Verification"
- Then go to App Passwords

---

### Issue: Still getting "Invalid login" after setting App Password

**Checklist:**
- [ ] Did you remove spaces from App Password?
- [ ] Did you use App Password (not regular password)?
- [ ] Did you set SMTP_USER to your correct Gmail?
- [ ] Did you click "Save" for each secret?
- [ ] Did you restart the edge function?
- [ ] Is SMTP_PORT set to `587` (not "587" with quotes)?

---

### Issue: "Authentication failed" with error code 535

**This means one of these:**
1. **Wrong App Password** → Generate a new one
2. **Spaces in password** → Remove all spaces
3. **Wrong Gmail account** → Double-check SMTP_USER
4. **Didn't restart function** → Restart it!

---

## 📋 Final Checklist:

Before testing, verify:

```
✅ 2-Step Verification enabled on Gmail
✅ App Password generated (16 characters)
✅ App Password has NO spaces
✅ SMTP_HOST = smtp.gmail.com
✅ SMTP_PORT = 587 (number, no quotes)
✅ SMTP_USER = your@gmail.com
✅ SMTP_PASSWORD = your-app-password (no spaces)
✅ SMTP_FROM = your@gmail.com
✅ All secrets saved in Supabase
✅ Edge function restarted
```

---

## 🎯 Quick Copy-Paste Template:

**Use this in Supabase Dashboard → Settings → Functions → Secrets:**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password-no-spaces
SMTP_FROM=your@gmail.com
```

**Replace:**
- `your@gmail.com` → Your actual Gmail address
- `your-app-password-no-spaces` → Your 16-character App Password (no spaces!)

---

## ✅ Success Indicators:

After fixing, you should see:

1. **In Resilio app:**
   ```
   ✅ Message scheduled!
   ```

2. **In browser console (F12):**
   ```
   📧 Future message email sent successfully
   ```

3. **In your Gmail inbox:**
   - Email from yourself
   - Subject: "Message from Your Past Self"

---

## 🆘 Still Not Working?

### Check Supabase Edge Function Logs:

1. Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/functions
2. Click on `make-server-40d4d8fd`
3. Check "Logs" tab
4. Look for error messages

### Common Log Errors:

**Error:** "SMTP_PASSWORD is undefined"
**Fix:** You forgot to set the SMTP_PASSWORD secret

**Error:** "Invalid login: 535"
**Fix:** Wrong App Password or forgot to remove spaces

**Error:** "EAUTH"
**Fix:** Gmail account or password is wrong

---

## 🎉 Expected Result:

**Before fix:**
```
❌ Email failed: Invalid login: 535-5.7.8
```

**After fix:**
```
✅ Message scheduled!
📧 Email sent successfully
```

---

## 📧 Support:

If still stuck after following all steps:

1. **Check Gmail App Password Guide:**
   - Open: `/GMAIL_APP_PASSWORD_GUIDE.md`

2. **Check Supabase Logs:**
   - https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/functions

3. **Double-check all 5 secrets are set correctly**

---

**This should fix your email error!** 🚀
