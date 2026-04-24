# Password Reset - Quick Fix Guide

## 🚨 "emailSent": false Issue Fix

Agar password reset email nahi aa rahi hai, to yeh steps follow karo:

## ⚡ Quick Fix (5 minutes)

### Step 1: APP_URL Environment Variable Set Karo

**Local Development:**
```bash
# Terminal mein run karo (in your project root)
export APP_URL=http://localhost:5173

# Ya .env file create karo
echo "APP_URL=http://localhost:5173" >> .env
```

**Supabase Dashboard (Production):**
1. Supabase Dashboard kholo
2. Project Settings → Edge Functions
3. Environment Variables section mein jao
4. Add New Variable:
   - Name: `APP_URL`
   - Value: `https://your-deployed-app-url.com`
5. Save karo

### Step 2: Edge Function Deploy Karo

```bash
# Updated auth.tsx deploy karo
supabase functions deploy make-server-40d4d8fd
```

### Step 3: Test Karo

1. Login page kholo
2. "Forgot Password?" click karo
3. Email enter karo
4. "Reset Password" button click karo
5. **Success message dikhai dega**
6. Email check karo (inbox + spam)

## 🔍 Verify kar lo

### Check 1: Environment Variable
```bash
# Supabase Dashboard Logs mein dekhna chahiye:
# "APP_URL: http://localhost:5173" (or your production URL)
```

### Check 2: Email Provider Status
Supabase Dashboard → Settings → Auth → Email Auth Provider

**Options:**
- ✅ Enable Email Provider (checked hona chahiye)
- ✅ Confirm Email (checked ya unchecked - dono work karenge)

### Check 3: Email Template
Supabase Dashboard → Authentication → Email Templates → Reset Password

Template active hona chahiye aur "{{ .ConfirmationURL }}" variable present hona chahiye.

## 📧 Email Nahi Aa Rahi? (Common Issues)

### Issue 1: Rate Limit (Supabase Free Tier)
**Problem:** Supabase free tier 3-4 emails per hour send karta hai
**Solution:** 
- 1 hour wait karo
- Ya custom SMTP setup karo (Resend SMTP recommended - see `/QUICK_RESEND_SETUP.md`)

### Issue 2: Spam Folder
**Problem:** Email spam mein chala gaya
**Solution:** Spam folder check karo

### Issue 3: Wrong APP_URL
**Problem:** APP_URL galat set hai
**Solution:** 
```bash
# Correct format:
APP_URL=https://your-app.vercel.app  # ✅ Correct
APP_URL=your-app.vercel.app          # ❌ Wrong (missing https://)
APP_URL=https://your-app.com/        # ⚠️ Trailing slash (remove karo)
```

### Issue 4: Edge Function Not Deployed
**Problem:** Updated code deployed nahi hai
**Solution:**
```bash
supabase functions deploy make-server-40d4d8fd
```

## 🎯 Working Example

### Frontend Request (LoginPage.tsx):
```javascript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/auth/reset-password`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({
      email: 'user@example.com'
    }),
  }
);

const data = await response.json();
console.log(data); // { success: true, message: 'Password reset email sent' }
```

### Backend Response (auth.tsx):
```javascript
// Success:
{ success: true, message: 'Password reset email sent' }

// Error:
{ error: 'Failed to send password reset email' }
```

## 🔧 Advanced Debugging

### Check Supabase Logs:
```bash
# Terminal:
supabase functions logs make-server-40d4d8fd --follow

# Ya Dashboard:
Supabase Dashboard → Edge Functions → make-server-40d4d8fd → Logs
```

**Dekhna chahiye:**
```
Password reset email sent to: user@example.com
APP_URL: https://your-app.com
redirectTo: https://your-app.com/#type=recovery
```

### Check Network Tab (Browser DevTools):
1. F12 press karo → Network tab
2. "Reset Password" button click karo
3. Request dekhna:
   - Status: 200 OK ✅
   - Response: `{ success: true, message: '...' }`

### Check Email in Supabase:
Supabase Dashboard → Authentication → Users → Select User → View User Details

Email confirmed hona chahiye.

## 📱 Testing Flow

### Complete Test:

1. **Send Reset Email:**
   - Login page → Forgot Password
   - Enter: test@example.com
   - Click: Reset Password
   - See: "Email Sent!" success message

2. **Check Email:**
   - Open inbox (or spam)
   - Email subject: "Reset Your Password" (or similar)
   - Click reset link

3. **Reset Password Page:**
   - URL should be: `your-app.com/#type=recovery&access_token=...`
   - Page shows: "Set New Password" form
   - Enter new password (meets requirements)
   - Confirm password
   - Click: Reset Password

4. **Success:**
   - See: "Password Reset Successful!" message
   - Click: Go to Login
   - Login with new password
   - ✅ Success!

## ✅ Checklist

Before testing, verify:

- [ ] APP_URL environment variable set hai
- [ ] Edge Function deployed hai
- [ ] Email provider enabled hai (Supabase Dashboard)
- [ ] Test email address valid hai
- [ ] Network connection stable hai
- [ ] Browser cache clear hai (optional)

## 🎉 All Working?

Agar sab kuch working hai, to aapko yeh dikhai dega:

1. ✅ "Forgot Password?" button works
2. ✅ Modal opens with email input
3. ✅ "Email Sent!" success message
4. ✅ Email received (inbox or spam)
5. ✅ Email link opens reset password page
6. ✅ Password updated successfully
7. ✅ Login works with new password

**Congratulations! 🎊 Password reset feature fully functional hai!**

## 📞 Still Having Issues?

Check detailed guide: `/PASSWORD_RESET_SETUP.md`

Or verify these files:
- `/components/LoginPage.tsx` (lines 108-183, 304-312, 349-452)
- `/components/ResetPasswordPage.tsx` (complete file)
- `/supabase/functions/server/auth.tsx` (lines 139-160)
- `/supabase/functions/server/index.tsx` (lines 138-152, 155-183)
- `/App.tsx` (lines 68-74, 284-293)