# 🔧 Fix RLS (Row Level Security) Error

## Problem
You're getting this error when uploading videos:
```
❌ new row violates row-level security policy
```

This happens because the `videos` table has RLS enabled but no policies to allow inserts.

---

## ✅ Solution (Choose ONE method)

### **Method 1: Run SQL in Supabase Dashboard (RECOMMENDED)**

This is the fastest and most reliable way.

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Paste and Run This SQL:**

```sql
-- Enable RLS on videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view videos" ON videos;
DROP POLICY IF EXISTS "Anon can insert videos" ON videos;
DROP POLICY IF EXISTS "Authenticated can insert videos" ON videos;
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;

-- Create policies that allow service role and anon access
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

4. **Click "Run"** (or press `Ctrl+Enter`)

5. **Verify** - Run this query to check policies:
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'videos';
```

You should see 5 policies listed. ✅

---

### **Method 2: Alternative - Disable RLS (Simpler but less secure)**

If you just want to prototype quickly and don't care about security yet:

```sql
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
```

⚠️ **WARNING:** This makes the table accessible to anyone. Only use for development/prototyping.

---

### **Method 3: Run Migration File**

If Method 1 doesn't work, try running the full migration:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `/supabase/migrations/001_create_videos_table.sql`
3. Paste into SQL Editor
4. Click "Run"

---

## 🧪 Test the Fix

After applying the fix:

1. **Restart your app** (to ensure fresh connection)
2. **Try uploading a video**
3. **Check the browser console** - you should see:
   ```
   ✅ Video saved to database successfully: video_xxxxx
   ```
4. **Reload the page** - videos should persist!

---

## 🔍 Why This Happens

- **RLS (Row Level Security)** is a Postgres security feature
- When enabled, it blocks all operations unless explicitly allowed by policies
- The `videos` table was created with RLS enabled but no policies
- The service role key *should* bypass RLS, but sometimes needs explicit policies
- Our fix adds policies that allow:
  - ✅ Anyone to read videos
  - ✅ Authenticated users to insert videos
  - ✅ Anon users to insert videos (for demo mode)
  - ✅ Users to update/delete their own videos

---

## 📊 Understanding the Policies

| Policy | What it does |
|--------|--------------|
| `Anyone can view videos` | Public read access - anyone can see videos |
| `Anon can insert videos` | Allows uploads with anon key (demo mode) |
| `Authenticated can insert videos` | Allows uploads with auth token |
| `Users can update own videos` | Allows editing own videos |
| `Users can delete own videos` | Allows deleting own videos |

---

## ❓ Still Having Issues?

If you're still getting RLS errors after trying all methods:

1. **Check your Supabase service role key** is correct in environment variables
2. **Verify the table exists:**
   ```sql
   SELECT * FROM videos LIMIT 1;
   ```
3. **Check current policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'videos';
   ```
4. **Try disabling RLS temporarily:**
   ```sql
   ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
   ```

---

## 🎉 Success!

Once fixed, you should be able to:
- ✅ Upload videos successfully
- ✅ Videos persist after page reload
- ✅ No more RLS errors in console
- ✅ Videos appear in feed immediately

Happy building! 🚀
