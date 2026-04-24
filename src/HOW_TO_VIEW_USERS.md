# 👥 How to View Your Users in Supabase

## Quick Access

**Direct Link to Your Users:**
```
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/auth/users
```

---

## Step-by-Step Guide

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard

### 2. Select Your Project
Click on: **wuzbuxeqqubolujjtizc** (Resilio project)

### 3. Navigate to Authentication
In the left sidebar, click: **Authentication** (shield icon)

### 4. View Users
Click on: **Users** tab

---

## What You'll See

### User Table Columns

| Column | Description | Example |
|--------|-------------|---------|
| **UID** | Unique user identifier | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| **Email** | User's email address | `john@example.com` |
| **Phone** | Phone number (if used) | Empty for email auth |
| **Providers** | Authentication method | `email` |
| **Created At** | Account creation date | `2024-11-28 10:30:00` |
| **Last Sign In** | Last login timestamp | `2024-11-28 14:45:00` |
| **Confirmed At** | Email confirmation date | `2024-11-28 10:30:00` |

---

## Viewing User Details

### Click on a User
Click on any user row to see full details:

#### Identity Tab
- **User ID** (UID)
- **Email** (confirmed/unconfirmed)
- **Phone** (if applicable)
- **Created timestamp**
- **Last sign in**
- **Email confirmed at**

#### User Metadata
Click "User Metadata" to see:
```json
{
  "name": "John Doe"
}
```

This is where the user's **Display Name** is stored!

#### App Metadata
System-managed data (usually empty for basic auth)

#### Raw User Data (JSON)
Full user object:
```json
{
  "id": "uuid-here",
  "aud": "authenticated",
  "role": "authenticated",
  "email": "user@example.com",
  "email_confirmed_at": "2024-11-28T10:30:00.000Z",
  "phone": "",
  "confirmed_at": "2024-11-28T10:30:00.000Z",
  "last_sign_in_at": "2024-11-28T14:45:00.000Z",
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "user_metadata": {
    "name": "John Doe"
  },
  "identities": [...],
  "created_at": "2024-11-28T10:30:00.000Z",
  "updated_at": "2024-11-28T14:45:00.000Z"
}
```

---

## User Management Actions

### From the Users Table

#### 1. Search Users
- Use the search bar to find users by email

#### 2. Filter Users
- Filter by provider (email, google, etc.)
- Filter by confirmation status

#### 3. Sort Users
- Sort by creation date
- Sort by last sign in
- Sort by email

### From User Details Page

#### 1. Edit User
- Change email
- Update user metadata (name)
- Add phone number

#### 2. Send Password Reset
- Click "Send password reset email"
- User receives reset link

#### 3. Confirm Email
- Manually confirm unconfirmed emails
- Useful for testing

#### 4. Delete User
- Permanently delete user account
- ⚠️ Cannot be undone!

---

## Checking User Authentication

### Verify Email is Confirmed
Look for: **Confirmed At** column

- ✅ Has timestamp → Email is confirmed
- ❌ Empty → Email not confirmed

In Resilio, all emails are auto-confirmed with:
```typescript
email_confirm: true
```

### Check Last Sign In
Look for: **Last Sign In** column

- Shows when user last logged in
- Updates automatically on each login

---

## Testing User Creation

### 1. Create Test User
In Resilio app:
1. Click "Sign Up"
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: test123

### 2. Verify in Supabase
1. Go to Users page
2. Look for: test@example.com
3. Click to view details
4. Check User Metadata shows: `{ "name": "Test User" }`

### 3. Test Login
1. Log out from Resilio
2. Log in with test@example.com
3. Check "Last Sign In" updates in Supabase

---

## Understanding Provider Types

### Current Setup: Email
```
Provider: email
```
Users sign up/in with email and password.

### Possible Future Additions

#### Google OAuth
```
Provider: google
```
Users sign in with Google account.

#### Facebook OAuth
```
Provider: facebook
```
Users sign in with Facebook account.

#### GitHub OAuth
```
Provider: github
```
Users sign in with GitHub account.

#### Magic Link
```
Provider: email (magic link)
```
Users receive login link via email (no password).

---

## Security Best Practices

### ✅ Do's
- ✅ Regularly check for suspicious sign-ups
- ✅ Monitor last sign-in timestamps
- ✅ Remove test accounts when done testing
- ✅ Keep service role key secret

### ❌ Don'ts
- ❌ Don't share user emails publicly
- ❌ Don't delete users without backing up data
- ❌ Don't expose user IDs in public APIs
- ❌ Don't store sensitive data in user_metadata

---

## Quick Links

### Your Supabase Dashboard
```
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc
```

### Authentication Settings
```
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/auth/users
```

### Auth Configuration
```
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/auth/providers
```

### Auth Policies (RLS)
```
https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/auth/policies
```

---

## Common Questions

### Q: Where is the user's name stored?
**A:** In `user_metadata.name` field

### Q: How do I change a user's name?
**A:** Update via API or manually in dashboard:
```typescript
updateUserProfile(userId, { name: "New Name" })
```

### Q: Can users change their email?
**A:** Yes, via the profile update endpoint

### Q: How do I add more user fields?
**A:** Add them to `user_metadata`:
```typescript
user_metadata: {
  name: "John Doe",
  avatar: "url",
  preferences: {...}
}
```

### Q: Where is password stored?
**A:** Encrypted in Supabase Auth (never visible)

### Q: Can I export user data?
**A:** Yes, use Supabase API or dashboard export

---

## Summary

✅ **Your users are stored in Supabase Authentication**
✅ **View them at:** https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/auth/users
✅ **User metadata contains the display name**
✅ **All authentication is handled by Supabase**
✅ **No custom database tables needed**

**Your setup is correct and secure!** 🎉
