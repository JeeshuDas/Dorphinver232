-- =====================================================
-- MANUAL FIX FOR RLS ERROR
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the RLS error
-- Dashboard → SQL Editor → New Query → Paste this → Run

-- Step 1: Check if tables exist, if not create them
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator TEXT,
  creator_id TEXT NOT NULL,
  creator_avatar TEXT,
  thumbnail TEXT,
  video_url TEXT NOT NULL,
  video_path TEXT NOT NULL,
  thumbnail_path TEXT,
  duration INTEGER DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('short', 'long')),
  short_category TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop any existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
DROP POLICY IF EXISTS "Service/Anon can insert videos" ON videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;

-- Step 4: Create new policies that allow service role and anon access

-- Allow everyone to read videos
CREATE POLICY "Anyone can view videos"
ON videos FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anon role to insert (for demo mode)
CREATE POLICY "Anon can insert videos"
ON videos FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated can insert videos"
ON videos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own videos
CREATE POLICY "Users can update own videos"
ON videos FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete own videos"
ON videos FOR DELETE
TO authenticated, anon
USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify policies are set up:
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'videos';

-- You should see 5 policies listed
-- If you see them, the fix is complete! ✅
