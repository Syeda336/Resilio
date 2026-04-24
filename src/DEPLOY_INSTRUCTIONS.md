# 🚀 DEPLOY TO SUPABASE EDGE FUNCTIONS

## ⚠️ IMPORTANT
You need to manually deploy these files because I don't have access to your Supabase account.

---

## 🎯 METHOD 1: Supabase CLI (RECOMMENDED - 30 seconds)

### Prerequisites:
- Supabase CLI installed
- Logged into your Supabase account

### Deploy Command:

```bash
# Navigate to your project root
cd /path/to/your/project

# Deploy the edge function
supabase functions deploy make-server-40d4d8fd

# Done! ✅
```

---

## 🎯 METHOD 2: Supabase Dashboard (If CLI doesn't work)

### Step 1: Go to Supabase Dashboard
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/functions

### Step 2: Find `make-server-40d4d8fd` function

### Step 3: Click "Deploy New Version"

### Step 4: Upload Files

You need to upload ALL files from `/supabase/functions/server/`:
- ✅ index.tsx
- ✅ activities.tsx
- ✅ auth.tsx
- ✅ dashboard.tsx
- ✅ email_nodemailer.tsx
- ✅ kv_store.tsx
- ✅ kv_store_with_user.tsx
- ✅ scheduler.tsx

**DO NOT upload these (optional/unused):**
- ❌ email.tsx (uses Resend - removed)
- ❌ email_simple.tsx (demo only)
- ❌ email_smtp.tsx (alternative implementation)

### Step 5: Click "Deploy"

---

## 🔧 What Files Are Included

Your `/supabase/functions/server/` directory contains:

| File | Status | Description |
|------|--------|-------------|
| `index.tsx` | ✅ REQUIRED | Main server entry point |
| `activities.tsx` | ✅ REQUIRED | Activity logging |
| `auth.tsx` | ✅ REQUIRED | Authentication |
| `dashboard.tsx` | ✅ REQUIRED | Dashboard stats |
| `email_nodemailer.tsx` | ✅ REQUIRED | Gmail SMTP emails |
| `kv_store.tsx` | ✅ REQUIRED | Key-value storage |
| `kv_store_with_user.tsx` | ✅ REQUIRED | User-scoped storage |
| `scheduler.tsx` | ✅ REQUIRED | Scheduled emails |
| `email.tsx` | ❌ SKIP | Uses Resend (removed) |
| `email_simple.tsx` | ❌ SKIP | Demo mode only |
| `email_smtp.tsx` | ❌ SKIP | Alternative implementation |

---

## ✅ After Deployment

### Test It Works:

1. Open browser console
2. Go to your Resilio app
3. Try creating a Future Self Message
4. Check console for success messages
5. Check Supabase Edge Function logs

### Verify Deployment:

```bash
# Check if function is deployed
curl -i https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/health
```

Expected response: `200 OK`

---

## 🐛 Troubleshooting

### Issue: "Function not found" (404)

**Solution:** Deploy the function first!

```bash
supabase functions deploy make-server-40d4d8fd
```

### Issue: "Permission denied"

**Solution:** Log in to Supabase CLI:

```bash
supabase login
supabase link --project-ref wuzbuxeqqubolujjtizc
```

### Issue: "Email errors" after deployment

**Solution:** Set environment variables in Supabase Dashboard:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your@gmail.com
```

---

## 📦 Quick Deploy Script

Copy and paste this:

```bash
#!/bin/bash
echo "🚀 Deploying to Supabase Edge Functions..."

# Deploy function
supabase functions deploy make-server-40d4d8fd

echo "✅ Deployment complete!"
echo ""
echo "Test it:"
echo "curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/health"
```

Save as `deploy.sh`, then:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🎯 Files to Deploy

**Copy these files to Supabase:**

```
/supabase/functions/server/index.tsx
/supabase/functions/server/activities.tsx
/supabase/functions/server/auth.tsx
/supabase/functions/server/dashboard.tsx
/supabase/functions/server/email_nodemailer.tsx
/supabase/functions/server/kv_store.tsx
/supabase/functions/server/kv_store_with_user.tsx
/supabase/functions/server/scheduler.tsx
```

**Skip these (not needed):**

```
/supabase/functions/server/email.tsx          # Uses Resend
/supabase/functions/server/email_simple.tsx   # Demo mode
/supabase/functions/server/email_smtp.tsx     # Alternative
```

---

## ✅ Success Indicators

After deployment, you should see:

1. ✅ Function appears in Supabase Dashboard
2. ✅ Health check returns 200 OK
3. ✅ App works without 404 errors
4. ✅ Emails send successfully
5. ✅ No "Function not found" errors

---

**Need Help?** 

Check Supabase logs:
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/functions
