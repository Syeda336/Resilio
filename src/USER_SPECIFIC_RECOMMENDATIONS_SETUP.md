# 🎯 User-Specific Daily Recommendations - Setup Guide

## ✅ Feature Overview

Ab har user ko apni **unique daily recommendation** milegi! Different email IDs se login karne par har user ko **alag-alag random tip** dikhegi.

---

## 📋 Setup Steps

### **Step 1: Create Supabase Table**

Supabase Dashboard mein jao aur ye SQL query run karo:

```sql
-- Create user_daily_recommendations table
CREATE TABLE IF NOT EXISTS user_daily_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id INTEGER NOT NULL,
  recommendation_text TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one recommendation per user per day
  UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_daily_recommendations_user_date 
ON user_daily_recommendations(user_id, date);

-- Enable Row Level Security
ALTER TABLE user_daily_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own recommendations
CREATE POLICY "Users can view own daily recommendations"
ON user_daily_recommendations
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own recommendations
CREATE POLICY "Users can insert own daily recommendations"
ON user_daily_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recommendations
CREATE POLICY "Users can update own daily recommendations"
ON user_daily_recommendations
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own recommendations
CREATE POLICY "Users can delete own daily recommendations"
ON user_daily_recommendations
FOR DELETE
USING (auth.uid() = user_id);
```

### **Step 2: Run SQL in Supabase**

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy-paste the above SQL
4. Click **Run** button
5. ✅ Table created successfully!

---

## 🎯 How It Works Now

### **User-Specific Logic:**

```
User 1 (alice@email.com) logs in
    ↓
Check Supabase for Alice's recommendation for today
    ↓
Not found? Generate random recommendation #42
    ↓
Save to database: Alice + Date + Recommendation #42
    ↓
Display: "Drink a glass of water..."

User 2 (bob@email.com) logs in (SAME DAY)
    ↓
Check Supabase for Bob's recommendation for today
    ↓
Not found? Generate random recommendation #17
    ↓
Save to database: Bob + Date + Recommendation #17
    ↓
Display: "Do 15 jumping jacks..."
```

### **Key Points:**

✅ **Each user** has their own recommendation  
✅ **Same recommendation** throughout the day for that user  
✅ **Different users** see **different recommendations**  
✅ **Next day** → New random recommendation for each user  
✅ **Stored in Supabase** (not localStorage)

---

## 📊 Database Structure

### **Table: `user_daily_recommendations`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Reference to auth.users (which user) |
| `recommendation_id` | INTEGER | ID number (1-96) |
| `recommendation_text` | TEXT | Full recommendation text |
| `date` | DATE | Date for this recommendation |
| `created_at` | TIMESTAMPTZ | When it was created |

### **Unique Constraint:**
- One recommendation per user per day
- `UNIQUE(user_id, date)`

---

## 🔒 Security (Row Level Security)

✅ **Users can only:**
- View their own recommendations
- Insert their own recommendations
- Update their own recommendations
- Delete their own recommendations

❌ **Users CANNOT:**
- See other users' recommendations
- Modify other users' data

---

## 🧪 Testing Scenarios

### **Test 1: Different Users, Same Day**

1. **Login as User A** (alice@email.com)
   - Should see Recommendation X
   
2. **Logout and Login as User B** (bob@email.com)
   - Should see Recommendation Y (different from X)
   
3. **Login as User A again**
   - Should see SAME Recommendation X (consistency)

### **Test 2: Same User, Different Days**

1. **Day 1:** Login as alice@email.com
   - Gets Recommendation #42
   
2. **Day 2:** Login as alice@email.com
   - Gets NEW Recommendation #17

### **Test 3: Multiple Users**

Create 3 different accounts and login with each:
- User 1: Gets random tip A
- User 2: Gets random tip B (different)
- User 3: Gets random tip C (different)

All on the same day, all different recommendations!

---

## 🔧 Technical Implementation

### **Files Modified:**

1. **`/utils/dailyRecommendations.ts`**
   - Now async function
   - Accepts `userId`, `accessToken`, `projectId`
   - Fetches from Supabase
   - Saves new recommendations to database

2. **`/components/DailyRecommendation.tsx`**
   - Accepts props: `userId`, `accessToken`, `projectId`
   - Calls async `getDailyRecommendation()`
   - Shows loading state

3. **`/components/Dashboard.tsx`**
   - Passes user credentials to component
   - `<DailyRecommendation userId={...} accessToken={...} projectId={...} />`

---

## 📝 Example Flow

### **Alice's Journey:**

**April 5, 2026 - 8:00 AM:**
```
Alice logs in → Dashboard loads
    ↓
Check database: No recommendation for Alice today
    ↓
Generate random: Recommendation #42
    ↓
Save to database:
  - user_id: alice-uuid
  - recommendation_id: 42
  - text: "Drink a glass of water..."
  - date: 2026-04-05
    ↓
Display beautiful banner with recommendation
```

**April 5, 2026 - 3:00 PM:**
```
Alice logs in again
    ↓
Check database: Found recommendation for Alice today
    ↓
Load existing: Recommendation #42
    ↓
Display SAME recommendation (consistency)
```

**April 6, 2026 - 7:00 AM:**
```
Alice logs in
    ↓
Check database: No recommendation for Alice for 2026-04-06
    ↓
Generate NEW random: Recommendation #17
    ↓
Display NEW recommendation
```

### **Bob's Journey (Same Day as Alice's first login):**

**April 5, 2026 - 9:00 AM:**
```
Bob logs in
    ↓
Check database: No recommendation for Bob today
    ↓
Generate random: Recommendation #88 (different from Alice's)
    ↓
Save to database:
  - user_id: bob-uuid
  - recommendation_id: 88
  - text: "Try to memorize a short poem..."
  - date: 2026-04-05
    ↓
Display Bob's unique recommendation
```

---

## 🎨 What Users See

### **User A's Dashboard:**
```
┌─────────────────────────────────────────────────┐
│ 💡 Daily Wellness Tip          Day 5            │
│                                                  │
│ "Drink a glass of water now and aim for        │
│  8 glasses today."                              │
└─────────────────────────────────────────────────┘
```

### **User B's Dashboard (Same Day):**
```
┌─────────────────────────────────────────────────┐
│ 💡 Daily Wellness Tip          Day 5            │
│                                                  │
│ "Do 15 jumping jacks to get your heart rate    │
│  up quickly."                                   │
└─────────────────────────────────────────────────┘
```

Both on April 5, but **different recommendations**! ✨

---

## 🚀 Benefits

✅ **User-Specific:** Har user ka apna unique tip  
✅ **Personalized Experience:** Different users, different content  
✅ **Persistent:** Supabase mein stored, browser change karne pe bhi same  
✅ **Consistent:** Poore din same tip  
✅ **Secure:** RLS policies protect user data  
✅ **Scalable:** Millions of users handle kar sakta hai  
✅ **Daily Refresh:** Automatically new tip next day  

---

## 🐛 Troubleshooting

### **Problem: Recommendation not showing**

**Solution:**
1. Check browser console for errors
2. Verify Supabase table exists
3. Confirm RLS policies are enabled
4. Check user is authenticated

### **Problem: Same recommendation for all users**

**Solution:**
1. Check `userId` is being passed correctly
2. Verify database has different entries per user
3. Run this query in Supabase SQL Editor:
```sql
SELECT * FROM user_daily_recommendations 
WHERE date = CURRENT_DATE;
```

### **Problem: Recommendation not changing next day**

**Solution:**
1. Check system date
2. Verify date column in database
3. Clear old test data if needed

---

## 🧹 Maintenance

### **Cleanup Old Data (Optional):**

Run this periodically to delete recommendations older than 7 days:

```sql
DELETE FROM user_daily_recommendations 
WHERE date < CURRENT_DATE - INTERVAL '7 days';
```

Or use the built-in cleanup function in code:
```typescript
await cleanupOldRecommendations(accessToken, projectId, 7);
```

---

## ✨ Summary

**Before:**
- ❌ Same recommendation for everyone (localStorage)
- ❌ Browser-specific data

**After:**
- ✅ Unique recommendation per user
- ✅ Stored in Supabase database
- ✅ Persistent across devices
- ✅ Secure with RLS policies
- ✅ Scalable architecture

**Ab har user ko apna personal daily wellness tip milega! 🎉**

---

## 📞 Support

Agar koi issue hai to:
1. Check browser console logs
2. Check Supabase logs
3. Verify table structure
4. Test with different users

**Happy Coding! 🚀**
