# 🚀 Authentication Quick Reference

## ✅ Your Setup Status

```
✅ Using Supabase Authentication (CORRECT)
✅ Users stored in auth.users table
✅ Display name in user_metadata
✅ Passwords encrypted with bcrypt
✅ JWT tokens for API authentication
✅ Session management automatic
✅ NO custom user tables (GOOD!)
```

---

## 📍 Quick Links

### View All Users
```
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/auth/users
```

### Auth Settings
```
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/auth/providers
```

### Your Project Dashboard
```
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc
```

---

## 📋 What's Stored Where

### Supabase Authentication
```typescript
{
  id: "uuid",                           // ✅ UID
  email: "user@example.com",            // ✅ Email
  encrypted_password: "bcrypt-hash",    // ✅ Password (secure)
  user_metadata: {
    name: "John Doe"                    // ✅ Display Name
  },
  created_at: "timestamp",              // ✅ Created At
  last_sign_in_at: "timestamp",         // ✅ Last Sign In
  app_metadata: {
    provider: "email",                  // ✅ Provider Type
    providers: ["email"]                // ✅ Providers
  },
  phone: ""                             // ✅ Phone (empty)
}
```

### KV Store (Application Data Only)
```
• diary_entry_{id}     → Journal entries
• reminder_{id}        → Reminders
• future_message_{id}  → Future messages
• diet_item_{id}       → Diet plans
• game_session_{id}    → Game sessions
• exercise_session_{id} → Exercise sessions
• care_buddy_session_{id} → Chat sessions
```

---

## 🔧 Key Functions

### Backend (`/supabase/functions/server/auth.tsx`)

```typescript
// Create new user
signUp(email, password, name)
→ Creates user in Supabase Auth
→ Stores name in user_metadata
→ Returns: { user, session }

// Sign in existing user
signIn(email, password)
→ Validates credentials
→ Returns: { user, session }

// Validate access token
getUser(accessToken)
→ Verifies JWT token
→ Returns: { user }

// Update user profile
updateUserProfile(userId, { name, email })
→ Updates Supabase Auth user
→ Stores name in user_metadata

// Update password
updateUserPassword(userId, newPassword)
→ Updates password in Supabase Auth
```

---

## 🔐 Authentication Flow

### Sign Up
```
User fills form
  ↓
Frontend validates
  ↓
POST /auth/signup
  ↓
Backend: supabaseAdmin.auth.admin.createUser()
  ↓
Supabase Auth creates user
  ↓
Returns: { user, session }
  ↓
Frontend stores token & redirects
```

### Login
```
User enters credentials
  ↓
POST /auth/login
  ↓
Backend: supabase.auth.signInWithPassword()
  ↓
Supabase Auth validates
  ↓
Returns: { user, session }
  ↓
Frontend stores token & redirects
```

### Authenticated Request
```
User performs action
  ↓
Frontend adds: Authorization: Bearer {token}
  ↓
Backend: getUser(token)
  ↓
Supabase Auth validates JWT
  ↓
Backend processes request
  ↓
Returns data to frontend
```

---

## 📊 User Data Structure

### In Supabase Dashboard
| Column | Value | Source |
|--------|-------|--------|
| UID | `a1b2c3...` | Auto-generated |
| Display Name | `John Doe` | user_metadata.name |
| Email | `john@example.com` | user.email |
| Phone | _(empty)_ | Not used |
| Providers | `email` | Auth method |
| Provider Type | `email` | Auth method |
| Created At | `2024-11-28 10:30` | Auto |
| Last Sign In | `2024-11-28 14:45` | Auto-updated |

---

## 🎯 Common Tasks

### Create Test User
```typescript
// In Resilio app
1. Click "Sign Up"
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. Submit
4. Check Supabase Dashboard
```

### View User Details
```typescript
1. Go to Supabase Dashboard
2. Click "Authentication" → "Users"
3. Click on user email
4. View all details + metadata
```

### Update User Name
```typescript
// Via API
await fetch('/auth/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Name'
  })
});

// Or manually in Supabase Dashboard
1. Click on user
2. Edit "User Metadata"
3. Update name field
4. Save
```

### Delete User
```typescript
// In Supabase Dashboard
1. Go to user details
2. Click "Delete user"
3. Confirm
⚠️ Cannot be undone!
```

---

## 🔍 Debugging Authentication

### Check if User is Created
```
1. Go to: https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/auth/users
2. Search for email
3. Check if user exists
```

### Check Last Sign In
```
1. Find user in dashboard
2. Look at "Last Sign In" column
3. Should update on each login
```

### Check Token is Valid
```typescript
// In browser console
const token = localStorage.getItem('resilio_access_token');
console.log('Token:', token);

// Backend will validate automatically
```

### Check User Metadata
```
1. Click on user in dashboard
2. Click "User Metadata" tab
3. Should see: { "name": "John Doe" }
```

---

## ⚡ API Endpoints

### POST `/make-server-40d4d8fd/auth/signup`
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": { "name": "John Doe" }
  },
  "session": {
    "access_token": "jwt-token"
  }
}
```

### POST `/make-server-40d4d8fd/auth/login`
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": { "id": "uuid", "email": "...", "user_metadata": {...} },
  "session": { "access_token": "jwt-token" }
}
```

### GET `/make-server-40d4d8fd/user/verify`
```
Headers:
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "valid": true
}
```

---

## 📝 Important Files

### Frontend
```
/components/SignUpPage.tsx    - Sign up form
/components/LoginPage.tsx     - Login form
/App.tsx                      - Auth state management
```

### Backend
```
/supabase/functions/server/auth.tsx    - Auth functions
/supabase/functions/server/index.tsx   - Auth endpoints
```

### Documentation
```
/SUPABASE_AUTH_DOCUMENTATION.md   - Full guide
/HOW_TO_VIEW_USERS.md             - Dashboard guide
/AUTH_FLOW_DIAGRAM.md             - Flow diagrams
/AUTH_QUICK_REFERENCE.md          - This file
```

---

## ✅ Verification Checklist

- [ ] Can create new user account
- [ ] Can log in with email/password
- [ ] User appears in Supabase Dashboard
- [ ] Display name stored in user_metadata
- [ ] Last sign in updates on login
- [ ] Token stored in localStorage
- [ ] Protected routes require authentication
- [ ] Can view user details in dashboard
- [ ] Password is encrypted (not visible)
- [ ] Session persists on page refresh

---

## 🎉 Bottom Line

```
┌────────────────────────────────────────┐
│                                         │
│  ✅ Your authentication is set up       │
│     correctly using Supabase Auth!      │
│                                         │
│  ✅ All user data is in the auth        │
│     system, not in custom tables        │
│                                         │
│  ✅ Display name is stored in           │
│     user_metadata as intended           │
│                                         │
│  ✅ NO CHANGES NEEDED!                  │
│                                         │
│  📍 View your users:                    │
│  supabase.com/dashboard/project/        │
│  wuzbuxeqqubolujjtizc/auth/users       │
│                                         │
└────────────────────────────────────────┘
```

**Your setup is perfect! 🚀**
