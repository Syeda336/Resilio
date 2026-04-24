# ⚡ Quick Resend SMTP Setup (5 Minutes)

## 🎯 Goal
Configure Supabase to send password reset emails through Resend SMTP for better deliverability and higher limits.

---

## 📋 Prerequisites

✅ You have: `RESEND_API_KEY = re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra`

---

## 🚀 Setup Steps

### Step 1: Open Supabase Dashboard

1. Go to: https://app.supabase.com
2. Select your project
3. Click on **Settings** (gear icon) in left sidebar
4. Click on **Authentication**

### Step 2: Enable Custom SMTP

1. Scroll down to **SMTP Settings**
2. Toggle **Enable Custom SMTP** to ON

### Step 3: Enter Resend SMTP Credentials

Fill in these values:

```
Sender Name:     Resilio
Sender Email:    onboarding@resend.dev
Host:            smtp.resend.com
Port Number:     465
Username:        resend
Password:        re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra
```

**Important Notes:**
- **Port 465** for SSL, or use **Port 587** for TLS
- **Username** is always `resend` (not your email)
- **Password** is your Resend API key
- **Sender Email** must be `onboarding@resend.dev` (Resend's test domain) or your verified domain

### Step 4: Save Configuration

Click **Save** button at the bottom

### Step 5: Test Email

1. Click **Send Test Email** button
2. Enter your email address
3. Check inbox (or spam folder)
4. You should receive a test email! ✅

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Custom SMTP is enabled (toggle ON)
- [ ] Host is `smtp.resend.com`
- [ ] Port is `465` or `587`
- [ ] Username is `resend`
- [ ] Password is your API key
- [ ] Test email received successfully
- [ ] No errors in Supabase logs

---

## 🎨 Optional: Customize Email Template

### Step 1: Go to Email Templates

1. In Supabase Dashboard
2. **Authentication** → **Email Templates**
3. Select **Reset Password** template

### Step 2: Customize HTML

Replace default template with this beautiful design:

```html
<h2 style="color: #8b5cf6;">🔒 Reset Your Password</h2>

<p>Hi there,</p>

<p>We received a request to reset your password for your <strong>Resilio</strong> account.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="display: inline-block; 
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
            color: white; 
            padding: 15px 40px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-size: 16px; 
            font-weight: 600;">
    Reset Password
  </a>
</p>

<div style="background-color: #fef3c7; 
            border: 1px solid #f59e0b; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;">
  <p style="margin: 0; color: #92400e;">
    ⚠️ <strong>Security Note:</strong> This link will expire in 24 hours.
  </p>
</div>

<p style="font-size: 14px; color: #6b7280;">
  If the button doesn't work, copy and paste this link:
</p>
<p style="font-size: 13px; 
          word-break: break-all; 
          background-color: #f3f4f6; 
          padding: 10px;">
  {{ .ConfirmationURL }}
</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

<p style="font-size: 12px; color: #9ca3af; text-align: center;">
  If you didn't request this, you can safely ignore this email.
</p>

<p style="font-size: 12px; color: #9ca3af; text-align: center;">
  Sent from <strong>Resilio</strong> - Your Personal Journal
</p>
```

### Step 3: Save Template

Click **Save** button

---

## 🧪 Test Password Reset

1. Open your app
2. Go to Login page
3. Click **"Forgot Password?"**
4. Enter your email
5. Click **"Reset Password"**
6. Check your inbox (or spam)
7. You should receive email from **onboarding@resend.dev**
8. Click reset link
9. Set new password
10. Login with new password ✅

---

## 📊 Benefits After Setup

### Before (Supabase Default):
- ❌ Rate Limit: 3-4 emails/hour
- ❌ ~100 emails/month max
- ❌ No analytics
- ❌ Basic template

### After (Resend SMTP):
- ✅ Rate Limit: Unlimited
- ✅ 3,000 emails/month (free tier)
- ✅ Email analytics in Resend dashboard
- ✅ Better deliverability
- ✅ Custom beautiful template
- ✅ Your branding

---

## 🔍 Troubleshooting

### Email Not Received?

**Check:**
1. Spam/junk folder
2. Email address is correct
3. Resend SMTP credentials are correct
4. Sender email is `onboarding@resend.dev`
5. Port is 465 or 587

**View Logs:**
1. Supabase Dashboard → Logs
2. Filter for "email" or "SMTP"
3. Look for error messages

**Check Resend Dashboard:**
1. Go to: https://resend.com/emails
2. See if email was sent
3. Check delivery status

### SMTP Connection Error?

**Solutions:**
- Try port 587 instead of 465
- Double-check username is `resend` (lowercase)
- Verify API key has no spaces
- Check if Resend account is active

### Template Variables Not Working?

**Make sure to use:**
- `{{ .ConfirmationURL }}` for reset link
- `{{ .Token }}` for token (if needed)
- `{{ .SiteURL }}` for site URL
- Double curly braces `{{ }}` not single `{ }`

---

## 📈 Monitor Email Delivery

### In Resend Dashboard:

1. Go to: https://resend.com/emails
2. See all sent emails
3. Check:
   - ✅ Delivered
   - 📬 Opened
   - 🖱️ Clicked
   - ❌ Bounced
   - 📧 Spam reported

### In Supabase Dashboard:

1. Go to: Logs
2. Filter by "email"
3. See SMTP connection logs

---

## 🎉 Success!

After setup, password reset emails will:
- ✅ Send faster
- ✅ Have better deliverability
- ✅ Include beautiful branding
- ✅ Provide analytics
- ✅ Work reliably

**No code changes needed!** 🚀

---

## 📞 Support

**Still having issues?**
- Check `/RESEND_API_SETUP.md` for detailed info
- Check `/PASSWORD_RESET_QUICK_FIX.md` for troubleshooting
- View Supabase logs for errors
- Check Resend dashboard for delivery status

**Want to use Resend API directly?**
- See `/RESEND_API_SETUP.md` for custom implementation
- Code already available in `/supabase/functions/server/email.tsx`

---

## 🔐 Security Reminder

- ✅ Keep your API key secret
- ✅ Don't commit it to git
- ✅ Use environment variables in production
- ✅ Rotate keys periodically
- ✅ Monitor for suspicious activity

---

**Setup complete! Enjoy better email delivery! 📧✨**
