# 🎯 Quick Fix: Email Sandbox Issue

## The Problem

```
You: "Send email to user@example.com"
Resend: "Sorry, only sending to verified emails!"
You: "But I want to send to ANYONE!"
Resend: "Verify your domain first!"
```

---

## Why This Happens

When using **`onboarding@resend.dev`** as sender:
- ✅ Resend sends to YOUR verified email
- ❌ Resend BLOCKS all other emails

This is **SANDBOX MODE** - meant for testing only!

---

## 3 Solutions (Choose One)

### 🟢 Solution 1: Quick Test (2 Minutes)

**For:** Testing with specific emails RIGHT NOW

**Steps:**
1. Open: https://resend.com/audiences
2. Click "Create Audience"
3. Name it "Test Users"
4. Click "Add Contact"
5. Enter email: `friend@email.com`
6. Save
7. That person gets verification email
8. They click verify
9. ✅ Done! Now emails will go to them

**Pros:** Super fast
**Cons:** Only works for verified emails

---

### 🟡 Solution 2: Verify Domain (30 Minutes)

**For:** Production app, unlimited emails

**Steps:**

#### A. Add Domain
1. Open: https://resend.com/domains
2. Click "Add Domain"
3. Enter: `yourdomain.com`

#### B. Get DNS Records
Resend will show you records like:

```
Type: TXT
Name: @
Value: resend-verify=abc123xyz
```

```
Type: TXT  
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

#### C. Add to Your Domain Provider

**GoDaddy:**
1. Login to GoDaddy
2. My Products → Domains → DNS
3. Click "Add" for each record
4. Copy Type, Name, Value from Resend
5. Save

**Namecheap:**
1. Login to Namecheap
2. Domain List → Manage → Advanced DNS
3. Add New Record for each
4. Save

**Cloudflare:**
1. Login to Cloudflare
2. Select domain → DNS
3. Add Record (click +)
4. Paste values
5. Save

#### D. Verify in Resend
1. Wait 5-10 minutes
2. Go back to Resend
3. Click "Verify"
4. ✅ Green checkmark = Success!

#### E. Update Your Code

**File:** `/supabase/functions/server/email.tsx`

**Find this (3 times):**
```javascript
from: 'onboarding@resend.dev',
```

**Replace with:**
```javascript
from: 'Resilio <noreply@yourdomain.com>',
```

**In all 3 functions:**
- Line 18: `sendFutureMessageEmail`
- Line 78: `sendReminderEmail`
- Line 142: `sendPasswordResetEmail`

#### F. Deploy
```bash
supabase functions deploy make-server-40d4d8fd
```

#### G. Test
✅ Now emails go to ANYONE!

---

### 🔵 Solution 3: Use Gmail SMTP (15 Minutes)

**For:** Don't have domain, need quick production fix

This option bypasses Resend and uses Gmail instead.

**See:** `/RESEND_API_SETUP.md` for Gmail SMTP setup

---

## Visual Comparison

### Before (Sandbox Mode):
```
Your App → Resend API → ❌ user1@gmail.com (BLOCKED)
                     → ❌ user2@yahoo.com (BLOCKED)
                     → ✅ you@email.com (YOUR verified email only)
```

### After (Domain Verified):
```
Your App → Resend API → ✅ user1@gmail.com
                     → ✅ user2@yahoo.com
                     → ✅ anyone@anywhere.com
```

---

## How to Check Current Mode

### Check 1: Look at Your Code

Open: `/supabase/functions/server/email.tsx`

**Line 18:**
```javascript
from: 'onboarding@resend.dev',  // ❌ SANDBOX MODE
```

**OR**
```javascript
from: 'noreply@yourdomain.com', // ✅ PRODUCTION MODE
```

### Check 2: Resend Dashboard

1. Go to: https://resend.com/domains
2. See any domains listed?
   - **No domains** = ❌ Sandbox mode
   - **Domain with ✅** = Production mode

### Check 3: Send Test Email

Send to a random Gmail account you don't own:
- **Received?** ✅ Production mode
- **Not received?** ❌ Sandbox mode

---

## Common Questions

### Q: I don't have a domain, what do I do?

**A:** Three options:
1. Buy a domain ($10-15/year from GoDaddy, Namecheap)
2. Use Gmail SMTP instead (free, 100 emails/day)
3. Only send to verified audience members (add them manually)

### Q: How much does a domain cost?

**A:** Very cheap!
- `.com` domain: $10-15/year
- `.dev` domain: $12/year
- `.app` domain: $12/year
- Buy from: GoDaddy, Namecheap, Google Domains, Cloudflare

### Q: Do I need email hosting?

**A:** No! You only need the domain name. Resend handles all email sending. You don't need Gmail, Outlook, etc.

### Q: Can I use a subdomain?

**A:** Yes!
- Domain: `yourdomain.com`
- Subdomain: `app.yourdomain.com`
- Email: `noreply@app.yourdomain.com`

### Q: How long does DNS verification take?

**A:** Usually 5-10 minutes, sometimes up to 1 hour, rarely 24 hours.

### Q: Can I test before DNS is verified?

**A:** No, you must wait for DNS to propagate. Use Solution 1 (Audience) for immediate testing.

---

## Step-by-Step: Domain Verification

### 1️⃣ Buy Domain (If Needed)

**Recommended Providers:**
- **Namecheap:** Cheap, easy UI
- **Cloudflare:** Best DNS management
- **GoDaddy:** Popular, good support
- **Google Domains:** Clean interface

**Price:** ~$12/year

### 2️⃣ Add to Resend

1. https://resend.com/domains
2. Click "Add Domain"
3. Enter: `yourdomain.com` (without www)
4. Click "Add"

### 3️⃣ Copy DNS Records

Resend shows you 3-4 records:

```
📋 Record 1 - Domain Verification
Type: TXT
Name: @ (or leave blank)
Value: resend-verify=abc123xyz456

📋 Record 2 - SPF (Sender Authentication)
Type: TXT
Name: @ (or leave blank)
Value: v=spf1 include:_spf.resend.com ~all

📋 Record 3 - DKIM (Email Signing)
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com

📋 Record 4 - DMARC (Optional but recommended)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; pct=100; rua=mailto:you@email.com
```

### 4️⃣ Add to DNS

**Namecheap Example:**

1. Login → Domain List → Manage
2. Advanced DNS tab
3. Click "Add New Record"
4. For each record:
   - Select Type (TXT or CNAME)
   - Enter Host (Name from Resend)
   - Enter Value
   - TTL: Automatic
   - Save

**Cloudflare Example:**

1. Select domain → DNS
2. Click "Add record"
3. For each record:
   - Type: Select from dropdown
   - Name: Copy from Resend
   - Content: Copy Value from Resend
   - Proxy: OFF (gray cloud)
   - Save

### 5️⃣ Wait & Verify

1. Wait 5-10 minutes
2. Check status: https://dnschecker.org
   - Enter: `yourdomain.com`
   - Type: TXT
   - Search
   - Should see your records
3. Go to Resend → Domains
4. Click "Verify"
5. ✅ Success!

### 6️⃣ Update Code

Change `from:` in 3 places in `/supabase/functions/server/email.tsx`:

```javascript
// Line 18
from: 'Resilio <noreply@yourdomain.com>',

// Line 78  
from: 'Resilio <noreply@yourdomain.com>',

// Line 142
from: 'Resilio <noreply@yourdomain.com>',
```

### 7️⃣ Deploy

```bash
supabase functions deploy make-server-40d4d8fd
```

### 8️⃣ Test

Send email to any address:
- Gmail ✅
- Yahoo ✅
- Outlook ✅
- Custom domains ✅
- ANY email address ✅

---

## Troubleshooting

### DNS Records Not Showing?

**Wait longer:**
- Typical: 5-10 minutes
- Sometimes: 1 hour
- Rarely: 24 hours

**Check DNS:**
- Use: https://dnschecker.org
- Enter your domain
- Type: TXT or CNAME
- Should see records globally

**Common mistakes:**
- Wrong "Name" field (check @ vs blank vs subdomain)
- Copy-paste error in Value
- Proxy enabled in Cloudflare (turn OFF)
- Wrong record Type

### Verification Fails?

**Check:**
1. All 3 records added (TXT, TXT, CNAME)
2. No typos in values
3. Used @ for Name (or blank, depends on provider)
4. Waited at least 10 minutes
5. DNS propagated (check dnschecker.org)

**Try:**
1. Delete and re-add records
2. Wait longer (up to 24h)
3. Contact domain provider support
4. Check Resend docs for your specific provider

### Emails Still Not Sending?

**Check:**
1. Domain verified (✅ green in Resend)
2. Code updated with new `from:` email
3. Edge Function redeployed
4. Using correct domain in `from:`
5. No typos in email address
6. Check Resend logs: https://resend.com/emails

---

## 🎉 Success Checklist

After setup, you should have:

- [ ] Domain verified in Resend (green ✅)
- [ ] All DNS records added
- [ ] Code updated in 3 places
- [ ] Edge Function deployed
- [ ] Test email sent to random Gmail
- [ ] Email received successfully
- [ ] No more "sandbox mode" issues
- [ ] Can send to unlimited addresses

---

## Quick Reference Card

**Problem:** Emails only to one address
**Cause:** Sandbox mode (`onboarding@resend.dev`)
**Solution:** Verify your domain
**Time:** 30 minutes
**Cost:** Free (if you have domain)

**Files to Edit:**
- `/supabase/functions/server/email.tsx` (lines 18, 78, 142)

**Deploy Command:**
```bash
supabase functions deploy make-server-40d4d8fd
```

**Check Status:**
- Resend: https://resend.com/domains
- DNS: https://dnschecker.org
- Logs: https://resend.com/emails

---

**Need more help? See `/RESEND_EMAIL_ISSUE_FIX.md` for detailed guide!**
