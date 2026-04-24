# Email Setup Guide for Resilio

## 📧 Email Configuration

Your Resilio application is now configured to send emails from:
**`Resilio <onboarding@resend.dev>`**

### ✅ Current Status: READY TO USE!

The `onboarding@resend.dev` domain is **pre-verified by Resend** and works immediately without any additional setup.

## 🎯 Quick Start

### What You Need:
1. **Resend API Key** (Get from: https://resend.com/api-keys)
2. **Supabase Edge Function** (Already configured!)
3. **That's it!** No domain verification needed.

## 🔧 Setup Steps

### 1. **Get Resend API Key**
1. Go to: https://resend.com/api-keys
2. Sign up or log in
3. Click "Create API Key"
4. Copy the API key

### 2. **Add API Key to Supabase**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Edge Functions** → **Secrets**
4. Click "Add Secret"
5. Name: `RESEND_API_KEY`
6. Value: Paste your API key
7. Click "Save"

### 3. **Deploy Edge Function**
Your edge function is already configured at:
```
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd
```

### 4. **Test Email Sending**
1. Open your Resilio app
2. Add a reminder or schedule a future message
3. Check your email inbox
4. You should receive an email from `onboarding@resend.dev`

## 📬 Email Types

### Future Self Messages
- **From:** Resilio <onboarding@resend.dev>
- **Subject:** ✨ Message from Your Past Self - Resilio
- **Purpose:** Sends scheduled messages to users

### Personal Reminders
- **From:** Resilio <onboarding@resend.dev>
- **Subject:** 🔔 Reminder: [Task Name] - Resilio
- **Purpose:** Sends reminder notifications to users

## ⚙️ Environment Variables

Required in Supabase Edge Functions → Secrets:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

## 🎨 Email Features

✅ **Beautiful HTML Templates**
- Gradient headers
- Responsive design
- Mobile-friendly
- Professional styling

✅ **Instant Delivery**
- No domain verification needed
- Works immediately
- Reliable delivery

✅ **User-Friendly**
- Clear formatting
- Emoji support
- Easy to read

## 🚀 Advantages of onboarding@resend.dev

### ✅ Pre-Verified
- No DNS setup required
- No domain verification
- Works out of the box

### ✅ Fast Setup
- Just add API key
- Deploy and go
- No waiting time

### ✅ Reliable
- Managed by Resend
- High deliverability
- No configuration needed

## 🔄 Upgrading to Custom Domain (Optional)

If you want to use your own domain (e.g., `noreply@formanite.fccollege.edu.pk`):

### Steps:
1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter: `formanite.fccollege.edu.pk`
4. Add provided DNS records to your domain
5. Wait for verification (24-48 hours)
6. Update `from` address in `/supabase/functions/server/email.tsx`

### DNS Records Needed:
```
Type: TXT
Name: @
Value: resend-verification=xxxxx

Type: MX  
Name: @
Value: feedback-smtp.resend.com
Priority: 10

Type: TXT
Name: @  
Value: v=spf1 include:_spf.resend.com ~all

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

## 🆘 Troubleshooting

### Emails Not Arriving?
1. ✅ Check RESEND_API_KEY is set in Supabase
2. ✅ Verify API key is valid at resend.com
3. ✅ Check spam/junk folder
4. ✅ Verify recipient email is correct
5. ✅ Check Resend dashboard for delivery logs

### API Key Issues?
1. Make sure key starts with `re_`
2. Key should be secret (not public)
3. Copy entire key without spaces
4. Regenerate if compromised

### Still Not Working?
1. Check Supabase Edge Function logs
2. View Resend dashboard → Logs
3. Verify edge function is deployed
4. Test with curl:
```bash
curl -X POST https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/send-reminder-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"task":"Test","scheduledDate":"2026-03-10","scheduledTime":"10:00","userEmail":"your@email.com"}'
```

## ✅ Verification Checklist

- [ ] Resend account created
- [ ] API key generated
- [ ] API key added to Supabase secrets
- [ ] Edge function deployed
- [ ] Test email sent
- [ ] Email received successfully

## 📊 Email Limits

### Free Tier (Resend):
- 100 emails/day
- 3,000 emails/month
- Perfect for personal use

### Paid Tier:
- Higher limits available
- See: https://resend.com/pricing

## 🎉 Ready to Go!

Your email system is configured and ready to use with `onboarding@resend.dev`. No additional setup required - just add your API key and start sending emails! 

---

**Support:** For Resend issues, visit https://resend.com/support