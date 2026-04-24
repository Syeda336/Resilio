# 🎯 Quick Setup: User-Specific Daily Recommendations

## ⚡ Fast Setup (5 Minutes)

### **Step 1: Create Supabase Table**

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS user_daily_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id INTEGER NOT NULL,
  recommendation_text TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_user_daily_recommendations_user_date 
ON user_daily_recommendations(user_id, date);

ALTER TABLE user_daily_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily recommendations"
ON user_daily_recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily recommendations"
ON user_daily_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily recommendations"
ON user_daily_recommendations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily recommendations"
ON user_daily_recommendations FOR DELETE
USING (auth.uid() = user_id);
```

### **Step 2: Done! ✅**

That's it! Ab test karo:

1. **Login as User A** → See Recommendation X
2. **Login as User B** → See Recommendation Y (different!)
3. **Login as User A again** → See SAME Recommendation X

---

## 🎯 How It Works

```
User 1: alice@email.com → "Drink water" 💧
User 2: bob@email.com   → "Do jumping jacks" 🏃
User 3: carol@email.com → "Read a book" 📚

All on same day, all different recommendations!
```

---

## 📊 Verify Table Created

Run this query to check:

```sql
SELECT * FROM user_daily_recommendations LIMIT 5;
```

Should show columns:
- id
- user_id
- recommendation_id
- recommendation_text
- date
- created_at

---

## 🐛 Quick Troubleshooting

**Not working?** Check:
1. ✅ Table created in Supabase
2. ✅ RLS policies enabled
3. ✅ User is authenticated
4. ✅ Browser console for errors

---

## ✨ Features

✅ **96 unique wellness tips**  
✅ **User-specific recommendations**  
✅ **Daily automatic rotation**  
✅ **Beautiful animated UI**  
✅ **Supabase backed**  
✅ **Secure with RLS**  

---

**That's it! Enjoy your personalized daily wellness tips! 🌟**
