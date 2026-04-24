# 🚀 DEPLOY YOUR SERVER NOW - 3 Simple Steps

## ⚠️ YOUR APP WON'T WORK UNTIL YOU DO THIS

The "Failed to fetch" error **CANNOT** be fixed by changing code.  
**YOU MUST DEPLOY THE SERVER.**

---

## ✅ 3-STEP DEPLOYMENT (5 minutes)

### Step 1: Install Supabase CLI

Choose one method:

**NPM (Recommended):**
```bash
npm install -g supabase
```

**macOS (Homebrew):**
```bash
brew install supabase/tap/supabase
```

**Windows (Scoop):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

---

### Step 2: Login & Link

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref wuzbuxeqqubolujjtizc
```

---

### Step 3: Deploy

```bash
# Navigate to your project folder (where /supabase folder is)
cd /path/to/your/resilio-project

# Deploy the Edge Function
supabase functions deploy server
```

**Expected Output:**
```
Deploying Function server...
Bundling server
Deployed Function server on project wuzbuxeqqubolujjtizc
https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/server
```

---

## ✅ TEST DEPLOYMENT

After deploying, test it worked:

```bash
curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/server/make-server-40d4d8fd/user/verify
```

**Expected Response:**
```json
{"error":"No access token provided"}
```

☝️ **This error is GOOD!** It means the server is running!

---

## 🎯 After Deployment

1. Go to your Resilio app
2. Try to sign up
3. You should NO LONGER see "Failed to fetch"
4. Account creation should work!

---

## 🔧 Set SMTP Secrets (Optional - for emails)

After deployment, configure email:

```bash
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=your-email@gmail.com  
supabase secrets set SMTP_PASSWORD=lidwvvvgopxcygbz
supabase secrets set SMTP_FROM=your-email@gmail.com
```

---

## 💡 Important Notes

### Why "server" and not "make-server-40d4d8fd"?

Your folder structure is `/supabase/functions/server/`, so the function is deployed as `server`.

The full endpoint path will be:
```
https://.../functions/v1/server/make-server-40d4d8fd/auth/signup
                        ^^^^^^ ^^^^^^^^^^^^^^^^^^^
                        function   route prefix
                        name
```

This is correct and intentional!

---

### Troubleshooting

**"command not found: supabase"**
- CLI not installed properly
- Try: `npm install -g supabase`

**"Failed to link project"**
- Wrong project ref
- Make sure it's: `wuzbuxeqqubolujjtizc`

**"No such function"**
- Wrong directory
- Make sure you're in the project root (where `/supabase` folder exists)

---

## 📊 Verification Checklist

After deployment:

- [ ] Curl command returns JSON error (not 404)
- [ ] Supabase Dashboard shows "server" function
- [ ] Signup page shows different error (not "Failed to fetch")
- [ ] Login page shows different error (not "Failed to fetch")  
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard loads

---

## 🆘 Still Getting "Failed to fetch"?

### Option 1: Check Dashboard

1. Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc
2. Click "Edge Functions" in sidebar
3. Look for "server" function
   - ✅ If it's there = deployed
   - ❌ If not there = deployment failed

### Option 2: Check Logs

```bash
supabase functions log server
```

Look for errors in the output.

### Option 3: Redeploy

```bash
supabase functions deploy server --no-verify-jwt
```

---

## ⏱️ How Long Does This Take?

- **First time:** ~5 minutes
- **Subsequent deploys:** ~30 seconds

---

## 🎉 SUCCESS LOOKS LIKE THIS

**Before Deployment:**
```
User clicks "Sign Up"
→ Error: "Sign up error: TypeError: Failed to fetch"
```

**After Deployment:**
```
User clicks "Sign Up"  
→ Account created successfully! ✅
→ Redirected to dashboard
```

---

## 📞 DEPLOY NOW!

**Stop reading. Start deploying:**

```bash
npm install -g supabase
supabase login
supabase link --project-ref wuzbuxeqqubolujjtizc
cd /path/to/your/project
supabase functions deploy server
```

**That's it! 🚀**

---

## ✨ What Happens After Deployment?

1. ✅ "Failed to fetch" errors disappear
2. ✅ Sign up works
3. ✅ Login works
4. ✅ Dashboard loads
5. ✅ All features work
6. ✅ Your app is LIVE!

---

**DEPLOY NOW. SERIOUSLY. IT'S QUICK. DO IT. 🚀🚀🚀**
