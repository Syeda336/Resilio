# 🔧 Resend Email Issue - Only One Email Receiving

## ❌ Problem

Emails are only being sent to **one specific email address**, and all other email addresses are **not receiving any emails**.

---

## 🎯 Root Cause

**Resend API is in SANDBOX MODE** by default!

When using `onboarding@resend.dev` as the sender email, Resend only sends emails to:
- ✅ **Verified email addresses** in your Resend account
- ✅ **Test email** you added during Resend setup
- ❌ **Not to any other email addresses**

This is Resend's security feature to prevent spam during development.

---

## ✅ Solution Options

### Option 1: Add Verified Email Addresses (Quick Fix)

**Best for:** Testing with specific emails

**Steps:**

1. **Go to Resend Dashboard:**
   - Open: https://resend.com/audiences
   - Login with your account

2. **Add Email to Audience:**
   - Click **"Audiences"** in sidebar
   - Click **"Create Audience"** or select existing
   - Click **"Add Contact"**
   - Enter the email address you want to test
   - Click **"Add"**

3. **Verify Email:**
   - User will receive verification email
   - They must click verify link
   - ✅ Now emails will be sent to this address!

4. **Repeat for All Test Emails:**
   - Add all email addresses you want to test
   - Each user must verify their email

**Limitation:** Can only send to verified emails in your audience

---

### Option 2: Verify Your Own Domain (Production Solution)

**Best for:** Production use, unlimited emails to any address

**Steps:**

#### 2.1: Add Your Domain to Resend

1. **Go to Resend Dashboard:**
   - Open: https://resend.com/domains
   - Click **"Add Domain"**

2. **Enter Your Domain:**
   - Example: `resilio.com` or `yourapp.com`
   - Click **"Add"**

3. **Add DNS Records:**
   - Resend will show you DNS records to add
   - Copy these records:
     - **TXT** record for domain verification
     - **MX** records (optional, for receiving emails)
     - **DKIM** records for authentication
     - **SPF** record for sender authentication

4. **Update DNS Settings:**
   - Go to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.)
   - Add all the DNS records provided by Resend
   - Wait 5-10 minutes for DNS propagation

5. **Verify in Resend:**
   - Go back to Resend Dashboard
   - Click **"Verify"** next to your domain
   - ✅ Domain verified!

#### 2.2: Update Your Code

Change the `from` email in `/supabase/functions/server/email.tsx`:

**Current (Sandbox):**
```javascript
from: 'onboarding@resend.dev',
```

**New (Your Domain):**
```javascript
from: 'noreply@yourdomain.com',
// or
from: 'Resilio <hello@yourdomain.com>',
```

**Full Example:**
```javascript
export async function sendFutureMessageEmail(userEmail?: string, message: string, scheduledDate: string, userName?: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Resilio <noreply@yourdomain.com>', // ✅ Changed
      to: userEmail,
      subject: `📬 Future Self Message - Scheduled for ${scheduledDate}`,
      // ... rest of the code
    }),
  });
}
```

**Apply to all 3 functions:**
- ✅ `sendFutureMessageEmail()`
- ✅ `sendReminderEmail()`
- ✅ `sendPasswordResetEmail()`

#### 2.3: Redeploy Edge Function

```bash
supabase functions deploy make-server-40d4d8fd
```

#### 2.4: Test

Now emails will be sent to **ANY email address** from your verified domain! 🎉

---

### Option 3: Use Different Email Provider (Alternative)

If you don't want to verify a domain, you can use:

**Gmail SMTP** (100 emails/day):
- Free
- No domain needed
- Easy setup

**SendGrid** (100 emails/day):
- Free tier
- No domain needed (but recommended)
- Better deliverability

**See setup in:** `/RESEND_API_SETUP.md`

---

## 🧪 How to Check Current Status

### Check 1: What's Your Current Sender Email?

Open `/supabase/functions/server/email.tsx` and look for `from:` field:

```javascript
from: 'onboarding@resend.dev', // ❌ Sandbox mode
from: 'noreply@yourdomain.com', // ✅ Production mode
```

### Check 2: Resend Dashboard

1. Go to: https://resend.com/domains
2. Check if you have a verified domain
3. If **no domains** → You're in sandbox mode ❌
4. If **domain verified** → You can send to anyone ✅

### Check 3: Resend Logs

1. Go to: https://resend.com/emails
2. Find recent emails
3. Check status:
   - **Delivered** ✅
   - **Bounced** ❌
   - **Not Sent** (recipient not in audience) ❌

---

## 📊 Comparison

| Method | Setup Time | Emails/Month | Send to Anyone? | Cost |
|--------|------------|--------------|-----------------|------|
| **Sandbox (Current)** | 0 min | 3,000 | ❌ No, only verified | Free |
| **Add to Audience** | 2 min | 3,000 | ⚠️ Only verified emails | Free |
| **Verify Domain** | 15-30 min | 3,000 | ✅ Yes | Free |
| **Paid Resend** | 5 min | 50,000+ | ✅ Yes | $20/month |

---

## 🚀 Recommended Action Plan

### For Testing (Now):

**Option A - Quick Test:**
1. Add your test emails to Resend Audience
2. Verify those emails
3. Test your app
4. ✅ Works for those specific emails

**Option B - Multiple Users:**
1. Ask each tester to verify their email in Resend
2. They'll receive verification email
3. After verification, they'll get your app emails
4. ✅ Works but manual process

### For Production (Before Launch):

**Required:**
1. Buy a domain (if you don't have one)
   - GoDaddy, Namecheap, Cloudflare: ~$10-15/year
2. Verify domain in Resend
3. Update `from:` email in code
4. Redeploy Edge Function
5. ✅ Send to unlimited emails!

---

## 🔧 Quick Fix Code

If you want to verify your domain and update the code right now:

### Step 1: Update Email Functions

**File:** `/supabase/functions/server/email.tsx`

**Change all 3 functions:**

```javascript
// Replace 'yourdomain.com' with your actual domain

// Function 1: Future Message
export async function sendFutureMessageEmail(userEmail?: string, message: string, scheduledDate: string, userName?: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Resilio <noreply@yourdomain.com>', // ✅ Update this
      to: userEmail,
      // ... rest stays same
    }),
  });
}

// Function 2: Reminder
export async function sendReminderEmail(userEmail?: string, task: string, scheduledDate: string, scheduledTime: string, userName?: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Resilio <noreply@yourdomain.com>', // ✅ Update this
      to: userEmail,
      // ... rest stays same
    }),
  });
}

// Function 3: Password Reset
export async function sendPasswordResetEmail(userEmail: string, resetLink: string, userName?: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Resilio <noreply@yourdomain.com>', // ✅ Update this
      to: userEmail,
      // ... rest stays same
    }),
  });
}
```

### Step 2: Deploy

```bash
supabase functions deploy make-server-40d4d8fd
```

### Step 3: Test

✅ Now emails will go to ANY email address!

---

## 📧 Popular Email Formats

Choose a professional sender email:

```javascript
// Option 1: No-reply (most common)
from: 'Resilio <noreply@yourdomain.com>',

// Option 2: Support
from: 'Resilio Support <support@yourdomain.com>',

// Option 3: Notifications
from: 'Resilio Notifications <notifications@yourdomain.com>',

// Option 4: Hello
from: 'Resilio <hello@yourdomain.com>',

// Option 5: Team
from: 'Resilio Team <team@yourdomain.com>',
```

---

## ⚠️ Important Notes

1. **Don't Use Gmail/Yahoo as Sender:**
   ```javascript
   from: 'yourname@gmail.com', // ❌ Will likely fail SPF checks
   ```

2. **Use Your Own Domain:**
   ```javascript
   from: 'noreply@yourdomain.com', // ✅ Better deliverability
   ```

3. **Verify Domain Before Production:**
   - Unverified domains = sandbox mode
   - Verified domains = unlimited recipients

4. **DNS Propagation:**
   - After adding DNS records, wait 5-60 minutes
   - Sometimes takes up to 24 hours (rare)
   - Use https://dnschecker.org to verify

---

## 🆘 Still Not Working?

### Debug Steps:

1. **Check Resend Logs:**
   - Go to: https://resend.com/emails
   - Find the email you tried to send
   - Check error message

2. **Common Errors:**
   - `"Recipient not in audience"` → You're in sandbox mode, verify domain
   - `"Domain not verified"` → Add DNS records
   - `"Invalid sender"` → Check `from:` email format
   - `"Rate limit exceeded"` → Wait or upgrade plan

3. **Check Code:**
   - Verify `userEmail` parameter is being passed correctly
   - Check console logs for email being sent to
   - Verify API key is correct

4. **Test with Curl:**
   ```bash
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<p>Testing</p>"
     }'
   ```

---

## ✅ Final Checklist

Before going to production:

- [ ] Domain purchased
- [ ] Domain added to Resend
- [ ] DNS records configured
- [ ] Domain verified in Resend (green checkmark)
- [ ] Updated `from:` email in all 3 functions
- [ ] Edge Function redeployed
- [ ] Tested with multiple different email addresses
- [ ] Checked spam folder
- [ ] Verified email delivery in Resend dashboard
- [ ] Configured proper email addresses (noreply@, support@, etc.)

---

## 💡 Pro Tips

1. **Use Environment Variable for Sender Email:**
   ```javascript
   const senderEmail = Deno.env.get('SENDER_EMAIL') || 'noreply@yourdomain.com';
   
   body: JSON.stringify({
     from: `Resilio <${senderEmail}>`,
     to: userEmail,
     // ...
   })
   ```

2. **Add Different Senders for Different Email Types:**
   - Future Messages: `messages@yourdomain.com`
   - Reminders: `reminders@yourdomain.com`
   - Password Reset: `security@yourdomain.com`

3. **Monitor Email Bounces:**
   - Check Resend dashboard regularly
   - Set up webhooks for bounce notifications
   - Clean up invalid email addresses

---

## 🎉 Summary

**Current Issue:**
- ❌ Emails only going to one address
- ❌ Using sandbox mode (`onboarding@resend.dev`)
- ❌ Can only send to verified audience members

**Solution:**
1. **Quick Fix:** Add email addresses to Resend Audience
2. **Production Fix:** Verify your domain in Resend
3. **Update Code:** Change `from:` to your domain email
4. **Redeploy:** Deploy Edge Function
5. **Test:** ✅ Emails will go to anyone!

**Need Help?**
- Check Resend docs: https://resend.com/docs
- Check DNS verification: https://dnschecker.org
- Contact Resend support: https://resend.com/support

---

**Get your domain verified and enjoy unlimited email sending! 🚀**
