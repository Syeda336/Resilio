# 📧 Resend API Setup for Password Reset

## ✅ Your Resend API Key

```
RESEND_API_KEY = re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra
```

---

## 🎯 Current Implementation

**Good News!** Your app already uses Resend API for:
- ✅ Future Self Message emails
- ✅ Personal Reminder emails

**Password Reset** currently uses **Supabase Auth's built-in email system**, which is fine because:
1. It's fully integrated with Supabase authentication
2. Handles token generation and validation automatically
3. Has built-in security features (24-hour expiry, one-time use)
4. Works out of the box

---

## 🔧 Two Approaches Available

### Approach 1: Use Supabase Auth Emails (Current - Recommended)

**Pros:**
- ✅ Already working
- ✅ Fully integrated with Supabase Auth
- ✅ Automatic token management
- ✅ Built-in security features
- ✅ No additional code needed

**Cons:**
- ❌ Uses Supabase's email service (rate limited on free tier: 3-4/hour)
- ❌ Can't customize email HTML as much
- ❌ Uses Supabase branding

**Setup Steps:**
1. Configure email templates in Supabase Dashboard
2. Set APP_URL environment variable
3. Deploy Edge Function
4. Done! ✅

---

### Approach 2: Use Resend for Password Reset (Custom Implementation)

**Pros:**
- ✅ Beautiful custom email design (like Future Messages)
- ✅ Better deliverability
- ✅ Higher rate limits (3000 emails/month on free tier)
- ✅ Detailed analytics in Resend dashboard
- ✅ Your branding

**Cons:**
- ❌ Requires custom token generation
- ❌ Need to manage token storage and expiry
- ❌ More complex implementation
- ❌ Need to handle security manually

**This would require significant code changes.**

---

## 💡 Recommendation: Hybrid Approach

**Best of both worlds:**

1. **For Password Reset:** Use Supabase Auth (current implementation)
   - Reliable, secure, built-in
   - Just configure custom SMTP in Supabase to avoid rate limits

2. **For Future Messages & Reminders:** Continue using Resend (already implemented)
   - Beautiful branded emails
   - Better analytics

---

## 🚀 Quick Setup: Configure Supabase to Use Custom SMTP

This way, password reset emails will still use Supabase Auth but will be sent through your own SMTP provider (like Gmail, SendGrid, or even Resend SMTP).

### Option A: Use Resend SMTP in Supabase

Resend also provides SMTP credentials you can use with Supabase!

1. **Get Resend SMTP Credentials:**
   - Go to: https://resend.com/settings/api-keys
   - Your API key: `re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra`
   
   **SMTP Settings for Resend:**
   ```
   Host: smtp.resend.com
   Port: 465 (or 587)
   Username: resend
   Password: re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra
   ```

2. **Configure in Supabase Dashboard:**
   - Project Settings → Auth → SMTP Settings
   - Enable Custom SMTP
   - Enter:
     - **Sender email:** `onboarding@resend.dev` (or your verified domain)
     - **Host:** `smtp.resend.com`
     - **Port:** `465`
     - **Username:** `resend`
     - **Password:** `re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra`
   - Save

3. **Customize Email Template:**
   - Authentication → Email Templates → Reset Password
   - Customize the HTML template
   - Use your branding colors
   - Save

4. **Test:**
   - Trigger password reset from your app
   - Email will be sent via Resend SMTP
   - Check Resend dashboard for delivery stats

### Option B: Use Gmail SMTP (Already Configured)

Your app already has Gmail SMTP configured for Future Messages and Reminders.

If you want to use the same Gmail account for password reset:

1. **Supabase Dashboard:**
   - Project Settings → Auth → SMTP Settings
   - Use the same Gmail SMTP credentials from your Edge Function secrets

2. **Test:**
   - Password reset emails will be sent from your Gmail account

---

## 📊 Comparison Table

| Feature | Supabase Default | Supabase + Custom SMTP | Custom Implementation |
|---------|------------------|------------------------|----------------------|
| **Setup Difficulty** | Easy ✅ | Medium 🟡 | Hard ❌ |
| **Email Rate Limit** | 3-4/hour ❌ | Unlimited ✅ | Unlimited ✅ |
| **Customization** | Limited 🟡 | Good ✅ | Full ✅ |
| **Security** | Built-in ✅ | Built-in ✅ | Manual ❌ |
| **Deliverability** | Good 🟡 | Excellent ✅ | Excellent ✅ |
| **Analytics** | Basic | Good ✅ | Full ✅ |
| **Maintenance** | None ✅ | Low ✅ | High ❌ |

---

## 🎨 Current Email Template (Resend API - Already Implemented)

Your app already has a beautiful Resend email template ready! Look at `/supabase/functions/server/email.tsx` line 132-194:

```javascript
export async function sendPasswordResetEmail(to: string, resetLink: string, userName?: string) {
  // Beautiful gradient email with:
  // - Purple/pink gradient header
  // - Large "Reset Password" button
  // - Security warning
  // - Fallback link
  // - Professional footer
}
```

**This function exists but is NOT currently being used.** It's ready if you want to implement the custom approach.

---

## ✅ Recommended Action Plan

### Quick Win (5 minutes):
1. Configure Resend SMTP in Supabase Dashboard
2. Customize email template (optional)
3. Test password reset
4. Done! ✅

### Future Enhancement (if needed):
1. Implement custom token generation
2. Switch to Resend API for password reset emails
3. Get full control and analytics

---

## 🧪 Testing Current Setup

**Test password reset with Supabase Auth:**

1. Open your app
2. Click "Forgot Password?"
3. Enter email
4. Check inbox (or spam)
5. Click reset link
6. Set new password
7. Login with new password

**Expected Email:**
- From: Supabase (or your SMTP provider if configured)
- Subject: "Reset your password"
- Contains reset link with token
- Link expires in 24 hours

---

## 📈 Email Statistics

### Current Setup (Supabase Default):
- **Rate Limit:** 3-4 emails/hour
- **Monthly Limit:** ~100 emails
- **Cost:** Free

### With Resend SMTP:
- **Rate Limit:** Unlimited
- **Monthly Limit:** 3,000 emails (free tier)
- **Cost:** Free up to 3,000 emails, then $0.10/1000 emails

### With Custom Resend API Implementation:
- **Rate Limit:** Unlimited
- **Monthly Limit:** 3,000 emails (free tier)
- **Cost:** Free up to 3,000 emails
- **Bonus:** Full email analytics, open rates, click tracking

---

## 🔐 Security Notes

**Both approaches are secure:**

1. **Supabase Auth Approach:**
   - Tokens generated by Supabase
   - Automatic expiry (24 hours)
   - One-time use tokens
   - Built-in rate limiting
   - ✅ **Recommended for most use cases**

2. **Custom Resend Approach:**
   - You manage token generation
   - You handle expiry logic
   - You implement one-time use
   - You add rate limiting
   - ⚠️ **More work, more control**

---

## 💼 Production Checklist

### Using Current Setup (Supabase Auth):
- [ ] Set `APP_URL` environment variable
- [ ] Deploy Edge Function
- [ ] (Optional) Configure custom SMTP in Supabase
- [ ] (Optional) Customize email template
- [ ] Test password reset flow
- [ ] Monitor email delivery

### Using Custom Resend API (Future):
- [ ] Implement token generation logic
- [ ] Create database table for reset tokens
- [ ] Add token expiry check
- [ ] Implement one-time use logic
- [ ] Update password reset endpoint
- [ ] Update frontend to handle new flow
- [ ] Test thoroughly
- [ ] Add rate limiting
- [ ] Monitor Resend analytics

---

## 📞 Support

**Current implementation is working!** Password reset uses Supabase Auth which is reliable and secure.

**Want to switch to Resend API?**
- The code is already written in `/supabase/functions/server/email.tsx`
- Just needs integration with custom token management
- Let me know if you want to implement this!

**Want better deliverability?**
- Just configure Resend SMTP in Supabase (5 minutes)
- No code changes needed
- Get benefits of Resend without custom implementation

---

## 🎉 Summary

**Your Resend API key is already in use for:**
✅ Future Self Messages
✅ Personal Reminders

**Password Reset currently uses:**
✅ Supabase Auth (built-in)

**Recommended next step:**
1. Configure Resend SMTP in Supabase Dashboard for better deliverability
2. Customize email template for better branding
3. Test and deploy

**Alternative (if you want full control):**
- Implement custom token management
- Use the `sendPasswordResetEmail()` function from `email.tsx`
- Get full analytics in Resend dashboard

---

**Your choice!** Both work great. Current setup is simpler and already functional. ✅
