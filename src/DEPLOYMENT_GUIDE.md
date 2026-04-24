# 🚀 Supabase Edge Function Deployment Guide

## ❌ Current Error: "Failed to fetch"

You're seeing this error because the **Supabase Edge Function is not deployed yet**.

---

## 📋 Step-by-Step Deployment Instructions

### 1. **Install Supabase CLI** (if not already installed)

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using npm
npm install -g supabase
```

---

### 2. **Login to Supabase**

```bash
supabase login
```

This will open a browser window to authenticate.

---

### 3. **Link Your Project**

```bash
# Get your project reference ID from Supabase dashboard URL
# Example: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc
# The reference ID is: wuzbuxeqqubolujjtizc

supabase link --project-ref wuzbuxeqqubolujjtizc
```

---

### 4. **Deploy the Edge Function**

From your project directory:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy make-server-40d4d8fd
```

**IMPORTANT:** Your function code is in `/supabase/functions/server/` but needs to be deployed as a single function.

---

### 5. **Set Environment Variables/Secrets**

After deployment, you need to set the secrets:

```bash
# Set Supabase secrets (already configured in your project)
# These should already be set, but verify:
supabase secrets list

# If SMTP secrets are missing, add them:
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=your-email@gmail.com
supabase secrets set SMTP_PASSWORD=lidwvvvgopxcygbz
supabase secrets set SMTP_FROM=your-email@gmail.com
```

**OR Set via Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/settings/functions
2. Click "Add new secret"
3. Add each secret (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM)

---

## 🧪 Test Deployment

### Option 1: Using Test Page

1. Open `/test-server.html` in your browser
2. Click "Test Server Availability"
3. If successful, you'll see ✅ Server is accessible!

### Option 2: Using curl

```bash
# Test basic connectivity
curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/user/verify

# Expected response:
# {"error":"No access token provided"}
# (This means server is running!)
```

### Option 3: Browser Console

```javascript
// Open browser console and run:
fetch('https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/user/verify')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// If you see an error object (not "Failed to fetch"), the server is running!
```

---

## 🔍 Troubleshooting

### Error: "Failed to fetch"

**Cause:** Edge Function not deployed

**Solution:**
1. Deploy the function using `supabase functions deploy`
2. Verify deployment in Supabase Dashboard → Edge Functions
3. Check function logs for errors

---

### Error: "SMTP credentials not configured"

**Cause:** SMTP secrets not set

**Solution:**
```bash
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=your-email@gmail.com
supabase secrets set SMTP_PASSWORD=your-app-password
supabase secrets set SMTP_FROM=your-email@gmail.com
```

---

### Error: "Module not found" or Import errors

**Cause:** Function code structure issue

**Solution:**
- Ensure all files are in `/supabase/functions/server/`
- Check that imports use correct paths
- Verify `index.tsx` has `Deno.serve(app.fetch)` at the end

---

### Function deploys but returns 500 errors

**Cause:** Runtime error in the function

**Solution:**
1. Check function logs:
   ```bash
   supabase functions log make-server-40d4d8fd
   ```
2. Or in Supabase Dashboard → Edge Functions → Logs
3. Look for error messages

---

## 📁 Function Structure

Your Edge Function should be structured like this:

```
/supabase
  /functions
    /server
      - index.tsx          (main entry point)
      - auth.tsx           (authentication logic)
      - activities.tsx     (activity tracking)
      - dashboard.tsx      (dashboard stats)
      - scheduler.tsx      (email scheduler)
      - email.tsx          (email sending)
      - kv_store.tsx       (database wrapper)
```

**Key requirement:** `index.tsx` must end with:
```typescript
Deno.serve(app.fetch);
```

---

## ✅ Verification Checklist

After deployment:

- [ ] Edge Function shows as "deployed" in Supabase Dashboard
- [ ] Opening `/test-server.html` shows ✅ Server is accessible
- [ ] Signup page shows error message (not "Failed to fetch")
- [ ] Login page shows error message (not "Failed to fetch")
- [ ] Supabase secrets are set (check in Dashboard → Settings → Edge Functions)

---

## 🎯 Quick Deployment Commands

```bash
# 1. Login
supabase login

# 2. Link project
supabase link --project-ref wuzbuxeqqubolujjtizc

# 3. Deploy function
supabase functions deploy make-server-40d4d8fd

# 4. Set SMTP secrets
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=your-email@gmail.com
supabase secrets set SMTP_PASSWORD=your-app-password
supabase secrets set SMTP_FROM=your-email@gmail.com

# 5. Test
curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/user/verify
```

---

## 📖 Official Documentation

- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)

---

## 🆘 Still Having Issues?

### Check Function Logs

**Via CLI:**
```bash
supabase functions log make-server-40d4d8fd --tail
```

**Via Dashboard:**
1. Go to Supabase Dashboard
2. Click "Edge Functions"
3. Click "make-server-40d4d8fd"
4. Click "Logs" tab

### Common Issues:

1. **Function not listed in dashboard**
   - Not deployed yet
   - Wrong project linked
   - Deploy using `supabase functions deploy`

2. **Function shows but returns errors**
   - Check logs for specific error
   - Verify environment variables are set
   - Check for syntax errors in code

3. **CORS errors**
   - Edge Functions should handle CORS automatically
   - Verify `app.use('*', cors())` is in index.tsx

---

## 💡 Next Steps After Deployment

Once your Edge Function is deployed:

1. ✅ Test signup with a new account
2. ✅ Test login with existing account
3. ✅ Verify dashboard loads
4. ✅ Check activity tracking works
5. ✅ Set up SMTP secrets for email features
6. ✅ Test scheduled email functionality

---

## 🎉 Success Indicators

You'll know deployment is successful when:

- ✅ `/test-server.html` shows "Server is accessible"
- ✅ Signup creates account without "Failed to fetch"
- ✅ Login works without "Failed to fetch"
- ✅ Dashboard loads user data
- ✅ Activities are tracked
- ✅ Emails send (after SMTP setup)

**Good luck! 🚀**
