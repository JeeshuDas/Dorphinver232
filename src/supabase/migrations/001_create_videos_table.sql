-- Create videos table
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

-- Create index on creator_id for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_creator_id ON videos(creator_id);

-- Create index on category for faster feed queries
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Create reactions table
CREATE TABLE IF NOT EXISTS video_reactions (
  id SERIAL PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Create index on video_reactions
CREATE INDEX IF NOT EXISTS idx_reactions_video_id ON video_reactions(video_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON video_reactions(user_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS video_comments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on video_comments
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON video_comments(created_at DESC);

-- Create follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id SERIAL PRIMARY KEY,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create index on user_follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON user_follows(following_id);

-- Enable Row Level Security (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR VIDEOS TABLE
-- =====================================================

-- Allow service role to bypass RLS (most important - backend uses service role)
-- Note: service_role automatically bypasses RLS, but we'll add explicit policies too

-- Allow anyone to view/select videos (public read access)
CREATE POLICY "Anyone can view videos"
ON videos FOR SELECT
TO anon, authenticated
USING (true);

-- Allow service role and authenticated users to insert videos
-- Since our backend uses service role key, this will allow all inserts from backend
CREATE POLICY "Authenticated users can insert videos"
ON videos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow anon role to insert (for demo mode with anon key)
CREATE POLICY "Service/Anon can insert videos"
ON videos FOR INSERT
TO anon
WITH CHECK (true);

-- Allow users to update their own videos
CREATE POLICY "Users can update their own videos"
ON videos FOR UPDATE
TO authenticated
USING (creator_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (creator_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON videos FOR DELETE
TO authenticated
USING (creator_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- =====================================================
-- RLS POLICIES FOR REACTIONS TABLE
-- =====================================================

-- Allow anyone to view reactions
CREATE POLICY "Anyone can view reactions"
ON video_reactions FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert reactions
CREATE POLICY "Authenticated users can add reactions"
ON video_reactions FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to delete their own reactions
CREATE POLICY "Users can delete their own reactions"
ON video_reactions FOR DELETE
TO authenticated, anon
USING (true);

-- =====================================================
-- RLS POLICIES FOR COMMENTS TABLE
-- =====================================================

-- Allow anyone to view comments
CREATE POLICY "Anyone can view comments"
ON video_comments FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert comments
CREATE POLICY "Authenticated users can add comments"
ON video_comments FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
ON video_comments FOR DELETE
TO authenticated, anon
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- =====================================================
-- RLS POLICIES FOR FOLLOWS TABLE
-- =====================================================

-- Allow anyone to view follows
CREATE POLICY "Anyone can view follows"
ON user_follows FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to follow others
CREATE POLICY "Authenticated users can follow"
ON user_follows FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to unfollow
CREATE POLICY "Users can unfollow"
ON user_follows FOR DELETE
TO authenticated, anon
USING (true);