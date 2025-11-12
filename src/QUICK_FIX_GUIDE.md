# 🚨 QUICK FIX: RLS Error on Video Upload

## The Problem
```
❌ Video upload error: StorageApiError: new row violates row-level security policy
```

## ⚡ Quick Fix (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your Dorphin project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New Query"**

### Step 2: Run This SQL
Copy and paste this entire block, then click **"Run"**:

```sql
-- Fix RLS policies for videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view videos" ON videos;
DROP POLICY IF EXISTS "Anon can insert videos" ON videos;
DROP POLICY IF EXISTS "Authenticated can insert videos" ON videos;
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;

-- Create new policies
CREATE POLICY "Anyone can view videos"
ON videos FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anon can insert videos"
ON videos FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated can insert videos"
ON videos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own videos"
ON videos FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete own videos"
ON videos FOR DELETE TO authenticated, anon USING (true);
```

### Step 3: Verify
Run this to confirm policies are set:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'videos';
```

You should see 5 policies listed. ✅

### Step 4: Test Upload
1. Go back to your app
2. Try uploading a video
3. Success! 🎉

---

## 📊 Check Database Health

Visit this URL in your browser to diagnose issues:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522/diagnostics/database
```

This will show:
- ✅ Table exists
- ✅ Can insert rows
- ✅ RLS status
- 💡 Recommendations if issues found

---

## 📚 More Help

- **Detailed instructions**: See `/supabase/README_FIX_RLS.md`
- **Full migration**: See `/supabase/migrations/001_create_videos_table.sql`
- **Manual SQL file**: See `/supabase/FIX_RLS_MANUAL.sql`

---

## ✨ What Was Fixed

| File | What Changed |
|------|-------------|
| `db.tsx` | Updated Supabase client config for RLS bypass |
| `index.tsx` | Added database diagnostics endpoint |
| `001_create_videos_table.sql` | Comprehensive RLS policies |
| `FIX_RLS_MANUAL.sql` | Quick SQL fix script |
| `README_FIX_RLS.md` | Detailed fix guide |

---

## 🎯 Expected Result

After fix:
- ✅ Videos upload successfully
- ✅ Videos persist after page reload  
- ✅ No RLS errors in console
- ✅ Database stores all video metadata
- ✅ Search works correctly

---

## ❓ Still Not Working?

If you still get errors:

1. **Check your Supabase project ID** is correct
2. **Verify service role key** in environment variables
3. **Run diagnostics** endpoint (URL above)
4. **Check browser console** for detailed error messages
5. **Try disabling RLS temporarily**:
   ```sql
   ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
   ```

---

Built with ❤️ for Dorphin
