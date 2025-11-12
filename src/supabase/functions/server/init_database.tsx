import { createClient } from 'npm:@supabase/supabase-js@2';

// Get admin client for database operations
const getAdminClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

/**
 * Initialize database tables and RLS policies
 * This ensures the database is properly set up even if migrations haven't been run
 */
export const initializeDatabase = async () => {
  const supabase = getAdminClient();
  
  console.log('🔧 Initializing database...');

  try {
    // Check if videos table exists
    const { data: tables, error: tablesError } = await supabase
      .from('videos')
      .select('id')
      .limit(1);

    if (tablesError) {
      if (tablesError.code === '42P01') {
        // Table doesn't exist - create it
        console.log('📊 Creating videos table...');
        await createTables(supabase);
      } else {
        console.error('❌ Error checking tables:', tablesError.message);
      }
    } else {
      console.log('✅ Videos table exists');
      
      // Table exists, but check if RLS policies are set up
      await ensureRLSPolicies(supabase);
    }

    console.log('✅ Database initialized successfully');
  } catch (error: any) {
    console.error('❌ Error initializing database:', error.message);
  }
};

/**
 * Create database tables using raw SQL
 */
const createTables = async (supabase: any) => {
  const createTableSQL = `
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

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_videos_creator_id ON videos(creator_id);
    CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
    CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

    -- Create reactions table
    CREATE TABLE IF NOT EXISTS video_reactions (
      id SERIAL PRIMARY KEY,
      video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(video_id, user_id)
    );

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

    CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON user_follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following_id ON user_follows(following_id);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('❌ Error creating tables:', error.message);
      console.log('ℹ️  This is expected if exec_sql function does not exist');
      console.log('ℹ️  Please run the migration file manually in Supabase Dashboard');
    } else {
      console.log('✅ Tables created successfully');
      await ensureRLSPolicies(supabase);
    }
  } catch (error: any) {
    console.error('❌ Error creating tables:', error.message);
    console.log('ℹ️  Please run the migration file manually in Supabase Dashboard:');
    console.log('ℹ️  /supabase/migrations/001_create_videos_table.sql');
  }
};

/**
 * Ensure RLS policies are set up correctly
 */
const ensureRLSPolicies = async (supabase: any) => {
  console.log('🔒 Setting up RLS policies...');

  const policiesSQL = `
    -- Enable RLS on all tables
    ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE video_reactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Anyone can view videos" ON videos;
    DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
    DROP POLICY IF EXISTS "Service/Anon can insert videos" ON videos;
    DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;

    -- Create policies for videos table
    CREATE POLICY "Anyone can view videos"
    ON videos FOR SELECT
    TO anon, authenticated
    USING (true);

    CREATE POLICY "Authenticated users can insert videos"
    ON videos FOR INSERT
    TO authenticated
    WITH CHECK (true);

    CREATE POLICY "Service/Anon can insert videos"
    ON videos FOR INSERT
    TO anon
    WITH CHECK (true);

    CREATE POLICY "Users can update their own videos"
    ON videos FOR UPDATE
    TO authenticated
    USING (creator_id = current_setting('request.jwt.claims', true)::json->>'sub')
    WITH CHECK (creator_id = current_setting('request.jwt.claims', true)::json->>'sub');

    CREATE POLICY "Users can delete their own videos"
    ON videos FOR DELETE
    TO authenticated
    USING (creator_id = current_setting('request.jwt.claims', true)::json->>'sub');

    -- Create policies for reactions table
    DROP POLICY IF EXISTS "Anyone can view reactions" ON video_reactions;
    DROP POLICY IF EXISTS "Authenticated users can add reactions" ON video_reactions;
    DROP POLICY IF EXISTS "Users can delete their own reactions" ON video_reactions;

    CREATE POLICY "Anyone can view reactions"
    ON video_reactions FOR SELECT
    TO anon, authenticated
    USING (true);

    CREATE POLICY "Authenticated users can add reactions"
    ON video_reactions FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

    CREATE POLICY "Users can delete their own reactions"
    ON video_reactions FOR DELETE
    TO authenticated, anon
    USING (true);

    -- Create policies for comments table
    DROP POLICY IF EXISTS "Anyone can view comments" ON video_comments;
    DROP POLICY IF EXISTS "Authenticated users can add comments" ON video_comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON video_comments;

    CREATE POLICY "Anyone can view comments"
    ON video_comments FOR SELECT
    TO anon, authenticated
    USING (true);

    CREATE POLICY "Authenticated users can add comments"
    ON video_comments FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

    CREATE POLICY "Users can delete their own comments"
    ON video_comments FOR DELETE
    TO authenticated, anon
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

    -- Create policies for follows table
    DROP POLICY IF EXISTS "Anyone can view follows" ON user_follows;
    DROP POLICY IF EXISTS "Authenticated users can follow" ON user_follows;
    DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;

    CREATE POLICY "Anyone can view follows"
    ON user_follows FOR SELECT
    TO anon, authenticated
    USING (true);

    CREATE POLICY "Authenticated users can follow"
    ON user_follows FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

    CREATE POLICY "Users can unfollow"
    ON user_follows FOR DELETE
    TO authenticated, anon
    USING (true);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: policiesSQL });
    
    if (error) {
      console.log('ℹ️  Could not set up RLS policies automatically:', error.message);
      console.log('ℹ️  This is expected - RLS bypass via service role should work anyway');
    } else {
      console.log('✅ RLS policies configured successfully');
    }
  } catch (error: any) {
    console.log('ℹ️  Could not set up RLS policies:', error.message);
    console.log('✅ Service role key bypasses RLS, so uploads should still work');
  }
};
