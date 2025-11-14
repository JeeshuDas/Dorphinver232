import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger(console.log));

// Supabase client for admin operations
const getAdminClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Supabase client for authenticated operations
const getClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const supabase = getAdminClient();
  
  // Check if this is the public anon key (for mock user mode)
  const publicAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (token === publicAnonKey) {
    // Mock user mode - allow access with demo user ID
    console.log('🎭 Using mock user mode (demo user)');
    c.set('userId', 'demo-user-id');
    c.set('user', {
      id: 'demo-user-id',
      email: 'demo@dorphin.app',
      user_metadata: {
        username: 'demo_user',
        displayName: 'Demo User'
      }
    });
    await next();
    return;
  }
  
  // Otherwise, validate the actual auth token
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.log('Auth error:', error);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('userId', user.id);
  c.set('user', user);
  await next();
};

// Initialize storage buckets
const initializeStorage = async () => {
  const supabase = getAdminClient();
  const bucketName = 'make-148a8522-dorphin-videos';
  const thumbnailBucketName = 'make-148a8522-dorphin-thumbnails';
  const profileBucketName = 'make-148a8522-dorphin-profiles';

  try {
    console.log('🔧 Initializing storage buckets...');
    
    // Helper function to ensure bucket exists with proper config
    const ensureBucket = async (name: string, options: any) => {
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = buckets?.some(bucket => bucket.name === name);
      
      if (!exists) {
        console.log(`📦 Creating bucket: ${name}...`);
        const { data, error } = await supabase.storage.createBucket(name, options);
        
        if (error) {
          console.error(`❌ Error creating bucket ${name}:`, error.message);
          return false;
        } else {
          console.log(`✅ Created bucket: ${name}`);
          return true;
        }
      } else {
        // Bucket exists - check if we need to update it
        console.log(`✓ Bucket already exists: ${name}`);
        
        // Try to update bucket to ensure proper settings
        const { error: updateError } = await supabase.storage.updateBucket(name, options);
        if (updateError) {
          console.log(`ℹ️  Could not update bucket ${name} (likely no changes needed):`, updateError.message);
        }
        return true;
      }
    };

    // Create/ensure buckets with proper configuration
    // Using public: true to avoid RLS issues, access control is done via signed URLs
    await ensureBucket(bucketName, { 
      public: true, // Make public to avoid RLS
      fileSizeLimit: 524288000, // 500MB
      allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm']
    });

    await ensureBucket(thumbnailBucketName, { 
      public: true, // Make public to avoid RLS
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    await ensureBucket(profileBucketName, { 
      public: true, // Make public to avoid RLS
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    console.log('✅ Storage buckets initialized successfully');
    
  } catch (error: any) {
    console.error('❌ Error initializing storage:', error.message);
  }
};

// Initialize test user
const initializeTestUser = async () => {
  try {
    const supabase = getAdminClient();
    const testEmail = 'demo@dorphin.app';
    const testPassword = 'demo123456';
    const demoUserId = 'demo-user-id';
    
    // Check if demo user profile exists in KV store
    const demoUserProfile = await kv.get(`user:${demoUserId}`);
    
    if (!demoUserProfile) {
      console.log('Creating demo user profile in KV store...');
      
      // Create demo user profile in KV store (without Supabase Auth for now)
      const userProfile = {
        id: demoUserId,
        email: testEmail,
        displayName: 'Demo User',
        username: 'demo_user',
        avatar: '#8b5cf6',
        bio: 'Exploring amazing content on Dorphin',
        followers: 0,
        following: 0,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      await kv.set(`user:${demoUserId}`, userProfile);
      await kv.set(`username:demo_user`, demoUserId);
      
      console.log('✅ Demo user profile created successfully!');
      console.log('👤 User ID:', demoUserId);
      console.log('📧 Email: demo@dorphin.app');
    } else {
      console.log('✅ Demo user profile already exists');
    }
  } catch (error) {
    console.error('Error initializing demo user:', error);
  }
};

// Initialize on startup
initializeStorage().catch(console.error);
initializeTestUser().catch(console.error);

// ==================== AUTH ENDPOINTS ====================

// Sign up with email and password
app.post('/make-server-148a8522/auth/signup', async (c) => {
  try {
    const { email, password, username, displayName } = await c.req.json();

    // Validation
    if (!email || !password || !username) {
      return c.json({ error: 'Email, password, and username are required' }, 400);
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
      return c.json({ error: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' }, 400);
    }

    // Validate password strength
    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters long' }, 400);
    }

    const supabase = getAdminClient();

    // Check if username already exists
    const existingUsers = await kv.getByPrefix('user:');
    const usernameExists = existingUsers.some((u: any) => 
      u.username?.toLowerCase() === username.toLowerCase()
    );

    if (usernameExists) {
      return c.json({ error: 'Username already taken' }, 400);
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for development. Set to false in production.
      user_metadata: {
        username,
        displayName: displayName || username,
      }
    });

    if (authError) {
      console.error('Signup auth error:', authError);
      
      // Handle specific errors
      if (authError.message.includes('already registered')) {
        return c.json({ error: 'Email already registered' }, 400);
      }
      
      return c.json({ error: authError.message || 'Failed to create account' }, 400);
    }

    if (!authData.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    // Create user profile in KV store
    const userProfile = {
      id: authData.user.id,
      email,
      username,
      displayName: displayName || username,
      avatar: username.slice(0, 2).toUpperCase(),
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${authData.user.id}`, userProfile);
    await kv.set(`username:${username.toLowerCase()}`, authData.user.id);

    console.log('✅ User created successfully:', authData.user.id);

    // Return user data without sensitive info
    return c.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: userProfile.username,
        displayName: userProfile.displayName,
        avatar: userProfile.avatar,
        bio: userProfile.bio,
      },
      message: 'Account created successfully',
    }, 201);

  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Sign in with email and password
app.post('/make-server-148a8522/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getClient();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    if (!data.user || !data.session) {
      return c.json({ error: 'Failed to sign in' }, 500);
    }

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${data.user.id}`);

    if (!userProfile) {
      // Create profile if it doesn't exist (for legacy users)
      const newProfile = {
        id: data.user.id,
        email: data.user.email!,
        username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
        displayName: data.user.user_metadata?.displayName || 'User',
        avatar: (data.user.user_metadata?.username || 'U').slice(0, 2).toUpperCase(),
        bio: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await kv.set(`user:${data.user.id}`, newProfile);
      
      return c.json({
        user: newProfile,
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      });
    }

    return c.json({
      user: userProfile,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });

  } catch (error: any) {
    console.error('Sign in error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Sign in with OAuth (Google/Apple)
app.post('/make-server-148a8522/auth/oauth', async (c) => {
  try {
    const { provider } = await c.req.json();

    if (!provider || !['google', 'apple'].includes(provider)) {
      return c.json({ error: 'Valid provider (google or apple) is required' }, 400);
    }

    const supabase = getClient();

    // Get the origin from the request headers
    const origin = c.req.header('origin') || c.req.header('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:3000';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'apple',
      options: {
        redirectTo: origin,
      }
    });

    if (error) {
      console.error('OAuth error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ url: data.url });

  } catch (error: any) {
    console.error('OAuth error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Sign out
app.post('/make-server-148a8522/auth/signout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    // If there's a token, try to sign out (but don't fail if it's invalid)
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const supabase = getAdminClient();
        await supabase.auth.admin.signOut(token);
        console.log('✅ Token invalidated on server');
      } catch (error) {
        // Token might be expired or invalid - that's fine, just log it
        console.log('ℹ️ Could not invalidate token on server (likely expired):', error);
      }
    }

    // Always return success - client will clear local state
    return c.json({ message: 'Signed out successfully' });

  } catch (error: any) {
    console.error('Sign out error:', error);
    // Still return success even if there's an error
    return c.json({ message: 'Signed out successfully' });
  }
});

// Get current user
app.get('/make-server-148a8522/auth/me', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({ user: userProfile });

  } catch (error: any) {
    console.error('Get user error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Refresh session
app.post('/make-server-148a8522/auth/refresh', async (c) => {
  try {
    const { refresh_token } = await c.req.json();

    if (!refresh_token) {
      return c.json({ error: 'Refresh token is required' }, 400);
    }

    const supabase = getClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
      console.error('Refresh error:', error);
      return c.json({ error: 'Failed to refresh session' }, 401);
    }

    if (!data.session) {
      return c.json({ error: 'Failed to refresh session' }, 401);
    }

    return c.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });

  } catch (error: any) {
    console.error('Refresh error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Update user profile
app.put('/make-server-148a8522/auth/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const updates = await c.req.json();

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Validate username if being updated
    if (updates.username && updates.username !== userProfile.username) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(updates.username) || updates.username.length < 3 || updates.username.length > 30) {
        return c.json({ error: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' }, 400);
      }

      // Check if new username is taken
      const existingUsers = await kv.getByPrefix('user:');
      const usernameExists = existingUsers.some((u: any) => 
        u.id !== userId && u.username?.toLowerCase() === updates.username.toLowerCase()
      );

      if (usernameExists) {
        return c.json({ error: 'Username already taken' }, 400);
      }

      // Delete old username mapping
      await kv.del(`username:${userProfile.username.toLowerCase()}`);
      // Create new username mapping
      await kv.set(`username:${updates.username.toLowerCase()}`, userId);
    }

    // Update profile
    const updatedProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedProfile);

    return c.json({ user: updatedProfile });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Upload profile picture
app.post('/make-server-148a8522/auth/upload-avatar', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const formData = await c.req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 5MB' }, 400);
    }

    const supabase = getAdminClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('make-148a8522-dorphin-profiles')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload avatar' }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('make-148a8522-dorphin-profiles')
      .getPublicUrl(fileName);

    // Update user profile
    const userProfile = await kv.get(`user:${userId}`);
    const updatedProfile = {
      ...userProfile,
      avatar: publicUrl,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedProfile);

    return c.json({ avatarUrl: publicUrl, user: updatedProfile });

  } catch (error: any) {
    console.error('Upload avatar error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// ==================== USER ROUTES ====================

// Get user profile
app.get('/make-server-148a8522/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const userProfile = await kv.get(`user:${userId}`);

    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: userProfile });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return c.json({ error: `Failed to get user profile: ${error.message}` }, 500);
  }
});

// ==================== VIDEO ROUTES ====================

// Upload video
app.post('/make-server-148a8522/videos/upload', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const formData = await c.req.formData();
    
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as 'short' | 'long';
    const shortCategory = formData.get('shortCategory') as string;
    const duration = parseInt(formData.get('duration') as string);

    if (!videoFile || !title || !category) {
      return c.json({ error: 'Video file, title, and category are required' }, 400);
    }

    const supabase = getAdminClient();
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Upload video file
    const videoPath = `${userId}/${videoId}.${videoFile.name.split('.').pop()}`;
    const videoBuffer = await videoFile.arrayBuffer();
    const { error: videoUploadError } = await supabase.storage
      .from('make-148a8522-dorphin-videos')
      .upload(videoPath, videoBuffer, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (videoUploadError) {
      console.error('Video upload error:', videoUploadError);
      return c.json({ error: `Video upload failed: ${videoUploadError.message}` }, 500);
    }

    // Get signed URL for video
    const { data: videoUrlData } = await supabase.storage
      .from('make-148a8522-dorphin-videos')
      .createSignedUrl(videoPath, 60 * 60 * 24 * 365); // 1 year

    let thumbnailUrl = '';
    if (thumbnailFile) {
      const thumbnailPath = `${userId}/${videoId}_thumb.${thumbnailFile.name.split('.').pop()}`;
      const thumbnailBuffer = await thumbnailFile.arrayBuffer();
      const { error: thumbnailUploadError } = await supabase.storage
        .from('make-148a8522-dorphin-thumbnails')
        .upload(thumbnailPath, thumbnailBuffer, {
          contentType: thumbnailFile.type,
          upsert: false,
        });

      if (!thumbnailUploadError) {
        const { data: thumbnailUrlData } = await supabase.storage
          .from('make-148a8522-dorphin-thumbnails')
          .createSignedUrl(thumbnailPath, 60 * 60 * 24 * 365); // 1 year
        thumbnailUrl = thumbnailUrlData?.signedUrl || '';
      }
    }

    // Get user profile
    const userProfile = await kv.get(`user:${userId}`);

    // Create video metadata
    const videoMetadata = {
      id: videoId,
      title,
      description: description || '',
      creator: userProfile?.displayName || 'Unknown',
      creator_id: userId,
      creator_avatar: userProfile?.avatar || '#FF6B9D',
      thumbnail: thumbnailUrl,
      video_url: videoUrlData?.signedUrl || '',
      video_path: videoPath, // Store path for regenerating signed URLs
      thumbnail_path: thumbnailFile ? `${userId}/${videoId}_thumb.${thumbnailFile.name.split('.').pop()}` : '',
      duration: duration || 0,
      category,
      short_category: category === 'short' ? shortCategory : undefined,
      views: 0,
      likes: 0,
      comments: 0,
      upload_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Save to KV store
    await kv.set(`video:${videoId}`, {
      ...videoMetadata,
      creatorId: userId,  // Keep camelCase for compatibility
      videoUrl: videoMetadata.video_url,
      videoPath: videoMetadata.video_path,
      thumbnailPath: videoMetadata.thumbnail_path,
      shortCategory: videoMetadata.short_category,
      creatorAvatar: videoMetadata.creator_avatar,
      uploadDate: videoMetadata.upload_date,
    });
    
    // Add to user's videos list
    const userVideosKey = `user:${userId}:videos`;
    const userVideos = await kv.get(userVideosKey) || [];
    userVideos.unshift(videoId);
    await kv.set(userVideosKey, userVideos);

    // Add to global videos list
    const categoryKey = category === 'short' ? 'videos:shorts' : 'videos:long';
    const categoryVideos = await kv.get(categoryKey) || [];
    categoryVideos.unshift(videoId);
    await kv.set(categoryKey, categoryVideos);

    // Return camelCase for frontend compatibility
    return c.json({ video: {
      id: videoId,
      title,
      description: description || '',
      creator: userProfile?.displayName || 'Unknown',
      creatorId: userId,
      creatorAvatar: userProfile?.avatar || '#FF6B9D',
      thumbnail: thumbnailUrl,
      videoUrl: videoUrlData?.signedUrl || '',
      videoPath,
      thumbnailPath: thumbnailFile ? `${userId}/${videoId}_thumb.${thumbnailFile.name.split('.').pop()}` : '',
      duration: duration || 0,
      category,
      shortCategory: category === 'short' ? shortCategory : undefined,
      views: 0,
      likes: 0,
      comments: 0,
      uploadDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    } });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return c.json({ error: `Video upload failed: ${error.message}` }, 500);
  }
});

// Save video metadata (for when files are uploaded directly to storage)
app.post('/make-server-148a8522/videos/metadata', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const { videoId, videoPath, thumbnailPath, title, description, category, shortCategory, duration } = body;

    if (!videoId || !videoPath || !title || !category) {
      return c.json({ error: 'Video ID, path, title, and category are required' }, 400);
    }

    const supabase = getAdminClient();

    // Generate signed URLs
    const { data: videoUrlData } = await supabase.storage
      .from('make-148a8522-dorphin-videos')
      .createSignedUrl(videoPath, 60 * 60 * 24 * 365); // 1 year

    let thumbnailUrl = '';
    if (thumbnailPath) {
      const { data: thumbnailUrlData } = await supabase.storage
        .from('make-148a8522-dorphin-thumbnails')
        .createSignedUrl(thumbnailPath, 60 * 60 * 24 * 365); // 1 year
      thumbnailUrl = thumbnailUrlData?.signedUrl || '';
    }

    // Get user profile
    const userProfile = await kv.get(`user:${userId}`);

    // Create video metadata
    const videoMetadata = {
      id: videoId,
      title,
      description: description || '',
      creator: userProfile?.displayName || 'Unknown',
      creatorId: userId,
      creatorAvatar: userProfile?.avatar || '#FF6B9D',
      thumbnail: thumbnailUrl,
      videoUrl: videoUrlData?.signedUrl || '',
      videoPath,
      thumbnailPath: thumbnailPath || '',
      duration: duration || 0,
      category,
      shortCategory: category === 'short' ? shortCategory : undefined,
      views: 0,
      likes: 0,
      comments: 0,
      uploadDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`video:${videoId}`, videoMetadata);
    
    // Add to user's videos list
    const userVideosKey = `user:${userId}:videos`;
    const userVideos = await kv.get(userVideosKey) || [];
    userVideos.unshift(videoId);
    await kv.set(userVideosKey, userVideos);

    // Add to global videos list
    const categoryKey = category === 'short' ? 'videos:shorts' : 'videos:long';
    const categoryVideos = await kv.get(categoryKey) || [];
    categoryVideos.unshift(videoId);
    await kv.set(categoryKey, categoryVideos);

    return c.json({ video: videoMetadata });
  } catch (error: any) {
    console.error('Video metadata save error:', error);
    return c.json({ error: `Failed to save video metadata: ${error.message}` }, 500);
  }
});

// Get videos feed
app.get('/make-server-148a8522/videos/feed', async (c) => {
  try {
    const category = c.req.query('category') || 'all';
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    let videoIds: string[] = [];
    
    if (category === 'short') {
      videoIds = await kv.get('videos:shorts') || [];
    } else if (category === 'long') {
      videoIds = await kv.get('videos:long') || [];
    } else {
      const shorts = await kv.get('videos:shorts') || [];
      const longs = await kv.get('videos:long') || [];
      videoIds = [...longs, ...shorts];
    }

    const paginatedIds = videoIds.slice(offset, offset + limit);
    const videos = await kv.mget(paginatedIds.map(id => `video:${id}`));

    // Refresh signed URLs if needed (simplified - in production you'd check expiry)
    const refreshedVideos = await Promise.all(videos.map(async (video) => {
      if (!video) return null;
      
      // For now, return video as-is. In production, you'd refresh expired URLs
      return video;
    }));

    return c.json({ 
      videos: refreshedVideos.filter(v => v !== null),
      total: videoIds.length,
      hasMore: (offset + limit) < videoIds.length
    });
  } catch (error: any) {
    console.error('Get feed error:', error);
    return c.json({ error: `Failed to get feed: ${error.message}` }, 500);
  }
});

// Search videos
app.get('/make-server-148a8522/videos/search', async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    
    if (!query || query.trim() === '') {
      return c.json({ videos: [], total: 0 });
    }

    console.log('🔍 Searching videos with query:', query);

    // Get all video IDs
    const shorts = await kv.get('videos:shorts') || [];
    const longs = await kv.get('videos:long') || [];
    const allVideoIds = [...longs, ...shorts];

    // Fetch all videos
    const allVideos = await kv.mget(allVideoIds.map(id => `video:${id}`));

    // Filter videos by title or description (case-insensitive partial match)
    const matchingVideos = allVideos.filter(video => {
      if (!video) return false;
      
      const title = (video.title || '').toLowerCase();
      const description = (video.description || '').toLowerCase();
      
      return title.includes(query) || description.includes(query);
    });

    console.log(`✅ Found ${matchingVideos.length} matching videos`);

    return c.json({ 
      videos: matchingVideos,
      total: matchingVideos.length
    });
  } catch (error: any) {
    console.error('Search videos error:', error);
    return c.json({ error: `Failed to search videos: ${error.message}` }, 500);
  }
});

// Get video by ID
app.get('/make-server-148a8522/videos/:videoId', async (c) => {
  try {
    const videoId = c.req.param('videoId');
    const video = await kv.get(`video:${videoId}`);

    if (!video) {
      return c.json({ error: 'Video not found' }, 404);
    }

    return c.json({ video });
  } catch (error: any) {
    console.error('Get video error:', error);
    return c.json({ error: `Failed to get video: ${error.message}` }, 500);
  }
});

// Get user's videos
app.get('/make-server-148a8522/users/:userId/videos', async (c) => {
  try {
    const userId = c.req.param('userId');
    const videoIds = await kv.get(`user:${userId}:videos`) || [];
    const videos = await kv.mget(videoIds.map(id => `video:${id}`));

    return c.json({ videos: videos.filter(v => v !== null) });
  } catch (error: any) {
    console.error('Get user videos error:', error);
    return c.json({ error: `Failed to get user videos: ${error.message}` }, 500);
  }
});

// Delete video
app.delete('/make-server-148a8522/videos/:videoId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const videoId = c.req.param('videoId');
    
    const video = await kv.get(`video:${videoId}`);
    if (!video) {
      return c.json({ error: 'Video not found' }, 404);
    }

    if (video.creatorId !== userId) {
      return c.json({ error: 'Unauthorized to delete this video' }, 403);
    }

    // Delete from storage
    const supabase = getAdminClient();
    if (video.videoPath) {
      await supabase.storage.from('make-148a8522-dorphin-videos').remove([video.videoPath]);
    }
    if (video.thumbnailPath) {
      await supabase.storage.from('make-148a8522-dorphin-thumbnails').remove([video.thumbnailPath]);
    }

    // Delete metadata
    await kv.del(`video:${videoId}`);

    // Remove from user's videos list
    const userVideosKey = `user:${userId}:videos`;
    const userVideos = await kv.get(userVideosKey) || [];
    await kv.set(userVideosKey, userVideos.filter((id: string) => id !== videoId));

    // Remove from category list
    const categoryKey = video.category === 'short' ? 'videos:shorts' : 'videos:long';
    const categoryVideos = await kv.get(categoryKey) || [];
    await kv.set(categoryKey, categoryVideos.filter((id: string) => id !== videoId));

    return c.json({ message: 'Video deleted successfully' });
  } catch (error: any) {
    console.error('Delete video error:', error);
    return c.json({ error: `Failed to delete video: ${error.message}` }, 500);
  }
});

// ==================== LIKE ROUTES ====================

// Like/unlike video
app.post('/make-server-148a8522/videos/:videoId/like', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const videoId = c.req.param('videoId');
    
    const likeKey = `like:${userId}:${videoId}`;
    const existingLike = await kv.get(likeKey);

    const video = await kv.get(`video:${videoId}`);
    if (!video) {
      return c.json({ error: 'Video not found' }, 404);
    }

    if (existingLike) {
      // Unlike
      await kv.del(likeKey);
      video.likes = Math.max(0, (video.likes || 0) - 1);
      await kv.set(`video:${videoId}`, video);
      
      return c.json({ liked: false, likes: video.likes });
    } else {
      // Like
      await kv.set(likeKey, { 
        userId, 
        videoId, 
        createdAt: new Date().toISOString() 
      });
      video.likes = (video.likes || 0) + 1;
      await kv.set(`video:${videoId}`, video);

      return c.json({ liked: true, likes: video.likes });
    }
  } catch (error: any) {
    console.error('Like/unlike error:', error);
    return c.json({ error: `Failed to like/unlike: ${error.message}` }, 500);
  }
});

// Check if user liked video
app.get('/make-server-148a8522/videos/:videoId/liked', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const videoId = c.req.param('videoId');
    
    const likeKey = `like:${userId}:${videoId}`;
    const liked = await kv.get(likeKey);

    return c.json({ liked: !!liked });
  } catch (error: any) {
    console.error('Check like error:', error);
    return c.json({ error: `Failed to check like: ${error.message}` }, 500);
  }
});

// ==================== COMMENT ROUTES ====================

// Add comment
app.post('/make-server-148a8522/videos/:videoId/comments', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const videoId = c.req.param('videoId');
    const { text, parentId } = await c.req.json();

    if (!text || text.trim().length === 0) {
      return c.json({ error: 'Comment text is required' }, 400);
    }

    const video = await kv.get(`video:${videoId}`);
    if (!video) {
      return c.json({ error: 'Video not found' }, 404);
    }

    // If parentId is provided, verify parent comment exists
    if (parentId) {
      const parentComment = await kv.get(`comment:${videoId}:${parentId}`);
      if (!parentComment) {
        return c.json({ error: 'Parent comment not found' }, 404);
      }
    }

    const userProfile = await kv.get(`user:${userId}`);
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const comment = {
      id: commentId,
      videoId,
      userId,
      user: userProfile?.displayName || 'User',
      avatar: userProfile?.avatar || '#FF6B9D',
      text: text.trim(),
      time: 'just now',
      createdAt: new Date().toISOString(),
      parentId: parentId || null,
    };

    await kv.set(`comment:${videoId}:${commentId}`, comment);

    // If it's a top-level comment, add to video's comments list
    if (!parentId) {
      const commentsKey = `video:${videoId}:comments`;
      const comments = await kv.get(commentsKey) || [];
      comments.unshift(commentId);
      await kv.set(commentsKey, comments);
    } else {
      // If it's a reply, add to parent's replies list
      const parentRepliesKey = `comment:${videoId}:${parentId}:replies`;
      const replies = await kv.get(parentRepliesKey) || [];
      replies.unshift(commentId);
      await kv.set(parentRepliesKey, replies);
    }

    // Update comment count (count all comments, including replies)
    video.comments = (video.comments || 0) + 1;
    await kv.set(`video:${videoId}`, video);

    return c.json({ comment });
  } catch (error: any) {
    console.error('Add comment error:', error);
    return c.json({ error: `Failed to add comment: ${error.message}` }, 500);
  }
});

// Get comments for video (with nested structure)
app.get('/make-server-148a8522/videos/:videoId/comments', async (c) => {
  try {
    const videoId = c.req.param('videoId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const commentsKey = `video:${videoId}:comments`;
    const commentIds = await kv.get(commentsKey) || [];
    
    const paginatedIds = commentIds.slice(offset, offset + limit);
    const comments = await kv.mget(paginatedIds.map(id => `comment:${videoId}:${id}`));

    // Recursively fetch replies for each comment
    const fetchReplies = async (commentId: string): Promise<any[]> => {
      const repliesKey = `comment:${videoId}:${commentId}:replies`;
      const replyIds = await kv.get(repliesKey) || [];
      
      if (replyIds.length === 0) return [];
      
      const replies = await kv.mget(replyIds.map(id => `comment:${videoId}:${id}`));
      
      // Recursively fetch nested replies
      const repliesWithNested = await Promise.all(
        replies.filter(r => r !== null).map(async (reply) => ({
          ...reply,
          replies: await fetchReplies(reply.id)
        }))
      );
      
      return repliesWithNested;
    };

    // Build comment tree
    const commentsWithReplies = await Promise.all(
      comments.filter(c => c !== null).map(async (comment) => ({
        ...comment,
        replies: await fetchReplies(comment.id)
      }))
    );

    return c.json({ 
      comments: commentsWithReplies,
      total: commentIds.length,
      hasMore: (offset + limit) < commentIds.length
    });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return c.json({ error: `Failed to get comments: ${error.message}` }, 500);
  }
});

// ==================== FOLLOW ROUTES ====================

// Follow a user
app.post('/make-server-148a8522/users/:targetUserId/follow', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const targetUserId = c.req.param('targetUserId');

    // 🚫 Prevent self-follow
    if (userId === targetUserId) {
      return c.json({ error: 'You cannot follow yourself' }, 400);
    }

    // Check if target user exists
    const targetUser = await kv.get(`user:${targetUserId}`);
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const followKey = `follow:${userId}:${targetUserId}`;
    const existingFollow = await kv.get(followKey);

    // Already following - return error
    if (existingFollow) {
      return c.json({ error: 'Already following this user' }, 400);
    }

    const currentUser = await kv.get(`user:${userId}`);

    // Create follow relationship
    await kv.set(followKey, { 
      followerId: userId, 
      followingId: targetUserId,
      createdAt: new Date().toISOString() 
    });

    // Update follower/following counts
    currentUser.following = (currentUser.following || 0) + 1;
    targetUser.followers = (targetUser.followers || 0) + 1;
    
    await kv.set(`user:${userId}`, currentUser);
    await kv.set(`user:${targetUserId}`, targetUser);

    // Add to following/followers lists for easier querying
    const followingListKey = `user:${userId}:following`;
    const followingList = await kv.get(followingListKey) || [];
    if (!followingList.includes(targetUserId)) {
      followingList.push(targetUserId);
      await kv.set(followingListKey, followingList);
    }

    const followersListKey = `user:${targetUserId}:followers`;
    const followersList = await kv.get(followersListKey) || [];
    if (!followersList.includes(userId)) {
      followersList.push(userId);
      await kv.set(followersListKey, followersList);
    }

    console.log(`✅ User ${userId} followed ${targetUserId}`);

    return c.json({ 
      following: true, 
      followers: targetUser.followers,
      message: 'Successfully followed user'
    });
  } catch (error: any) {
    console.error('Follow error:', error);
    return c.json({ error: `Failed to follow user: ${error.message}` }, 500);
  }
});

// Unfollow a user
app.delete('/make-server-148a8522/users/:targetUserId/follow', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const targetUserId = c.req.param('targetUserId');

    // 🚫 Prevent self-unfollow (shouldn't happen but check anyway)
    if (userId === targetUserId) {
      return c.json({ error: 'Invalid operation' }, 400);
    }

    const followKey = `follow:${userId}:${targetUserId}`;
    const existingFollow = await kv.get(followKey);

    // Not following - return error
    if (!existingFollow) {
      return c.json({ error: 'Not following this user' }, 400);
    }

    const currentUser = await kv.get(`user:${userId}`);
    const targetUser = await kv.get(`user:${targetUserId}`);

    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Remove follow relationship
    await kv.del(followKey);
    
    // Update follower/following counts
    currentUser.following = Math.max(0, (currentUser.following || 0) - 1);
    targetUser.followers = Math.max(0, (targetUser.followers || 0) - 1);
    
    await kv.set(`user:${userId}`, currentUser);
    await kv.set(`user:${targetUserId}`, targetUser);

    // Remove from following/followers lists
    const followingListKey = `user:${userId}:following`;
    const followingList = await kv.get(followingListKey) || [];
    const updatedFollowingList = followingList.filter((id: string) => id !== targetUserId);
    await kv.set(followingListKey, updatedFollowingList);

    const followersListKey = `user:${targetUserId}:followers`;
    const followersList = await kv.get(followersListKey) || [];
    const updatedFollowersList = followersList.filter((id: string) => id !== userId);
    await kv.set(followersListKey, updatedFollowersList);

    console.log(`✅ User ${userId} unfollowed ${targetUserId}`);

    return c.json({ 
      following: false, 
      followers: targetUser.followers,
      message: 'Successfully unfollowed user'
    });
  } catch (error: any) {
    console.error('Unfollow error:', error);
    return c.json({ error: `Failed to unfollow user: ${error.message}` }, 500);
  }
});

// Toggle follow/unfollow (for convenience)
app.post('/make-server-148a8522/users/:targetUserId/toggle-follow', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const targetUserId = c.req.param('targetUserId');

    // 🚫 Prevent self-follow
    if (userId === targetUserId) {
      return c.json({ error: 'You cannot follow yourself' }, 400);
    }

    const targetUser = await kv.get(`user:${targetUserId}`);
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const followKey = `follow:${userId}:${targetUserId}`;
    const existingFollow = await kv.get(followKey);
    const currentUser = await kv.get(`user:${userId}`);

    if (existingFollow) {
      // Unfollow
      await kv.del(followKey);
      
      currentUser.following = Math.max(0, (currentUser.following || 0) - 1);
      targetUser.followers = Math.max(0, (targetUser.followers || 0) - 1);
      
      await kv.set(`user:${userId}`, currentUser);
      await kv.set(`user:${targetUserId}`, targetUser);

      // Remove from lists
      const followingListKey = `user:${userId}:following`;
      const followingList = await kv.get(followingListKey) || [];
      await kv.set(followingListKey, followingList.filter((id: string) => id !== targetUserId));

      const followersListKey = `user:${targetUserId}:followers`;
      const followersList = await kv.get(followersListKey) || [];
      await kv.set(followersListKey, followersList.filter((id: string) => id !== userId));

      console.log(`✅ User ${userId} unfollowed ${targetUserId}`);

      return c.json({ 
        following: false, 
        followers: targetUser.followers 
      });
    } else {
      // Follow
      await kv.set(followKey, { 
        followerId: userId, 
        followingId: targetUserId,
        createdAt: new Date().toISOString() 
      });

      currentUser.following = (currentUser.following || 0) + 1;
      targetUser.followers = (targetUser.followers || 0) + 1;
      
      await kv.set(`user:${userId}`, currentUser);
      await kv.set(`user:${targetUserId}`, targetUser);

      // Add to lists
      const followingListKey = `user:${userId}:following`;
      const followingList = await kv.get(followingListKey) || [];
      if (!followingList.includes(targetUserId)) {
        followingList.push(targetUserId);
        await kv.set(followingListKey, followingList);
      }

      const followersListKey = `user:${targetUserId}:followers`;
      const followersList = await kv.get(followersListKey) || [];
      if (!followersList.includes(userId)) {
        followersList.push(userId);
        await kv.set(followersListKey, followersList);
      }

      console.log(`✅ User ${userId} followed ${targetUserId}`);

      return c.json({ 
        following: true, 
        followers: targetUser.followers 
      });
    }
  } catch (error: any) {
    console.error('Toggle follow error:', error);
    return c.json({ error: `Failed to toggle follow: ${error.message}` }, 500);
  }
});

// Check if following a user (get follow status)
app.get('/make-server-148a8522/users/:targetUserId/following', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const targetUserId = c.req.param('targetUserId');
    
    // Can't follow yourself
    if (userId === targetUserId) {
      return c.json({ following: false, self: true });
    }

    const followKey = `follow:${userId}:${targetUserId}`;
    const following = await kv.get(followKey);

    return c.json({ following: !!following });
  } catch (error: any) {
    console.error('Check following error:', error);
    return c.json({ error: `Failed to check following: ${error.message}` }, 500);
  }
});

// Get follow status for multiple users (batch check)
app.post('/make-server-148a8522/users/following/batch', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { userIds } = await c.req.json();

    if (!Array.isArray(userIds)) {
      return c.json({ error: 'userIds must be an array' }, 400);
    }

    const followStatuses: Record<string, boolean> = {};
    
    for (const targetUserId of userIds) {
      if (userId === targetUserId) {
        followStatuses[targetUserId] = false; // Can't follow yourself
      } else {
        const followKey = `follow:${userId}:${targetUserId}`;
        const following = await kv.get(followKey);
        followStatuses[targetUserId] = !!following;
      }
    }

    return c.json({ followStatuses });
  } catch (error: any) {
    console.error('Batch check following error:', error);
    return c.json({ error: `Failed to check following: ${error.message}` }, 500);
  }
});

// Get user's followers list
app.get('/make-server-148a8522/users/:userId/followers', async (c) => {
  try {
    const targetUserId = c.req.param('userId');
    
    // Get followers list (optimized)
    const followersListKey = `user:${targetUserId}:followers`;
    const followerIds = await kv.get(followersListKey) || [];
    
    // Fetch user profiles for each follower
    const followerProfiles = await Promise.all(
      followerIds.map(async (followerId: string) => {
        const user = await kv.get(`user:${followerId}`);
        return user ? {
          id: followerId,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          isVerified: user.isVerified || false,
        } : null;
      })
    );

    const validFollowers = followerProfiles.filter(f => f !== null);

    return c.json({ 
      followers: validFollowers,
      count: validFollowers.length
    });
  } catch (error: any) {
    console.error('Get followers error:', error);
    return c.json({ error: `Failed to get followers: ${error.message}` }, 500);
  }
});

// Get user's following list
app.get('/make-server-148a8522/users/:userId/following', async (c) => {
  try {
    const targetUserId = c.req.param('userId');
    
    // Get following list (optimized)
    const followingListKey = `user:${targetUserId}:following`;
    const followingIds = await kv.get(followingListKey) || [];
    
    // Fetch user profiles for each following
    const followingProfiles = await Promise.all(
      followingIds.map(async (followingId: string) => {
        const user = await kv.get(`user:${followingId}`);
        return user ? {
          id: followingId,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          isVerified: user.isVerified || false,
        } : null;
      })
    );

    const validFollowing = followingProfiles.filter(f => f !== null);

    return c.json({ 
      following: validFollowing,
      count: validFollowing.length
    });
  } catch (error: any) {
    console.error('Get following error:', error);
    return c.json({ error: `Failed to get following: ${error.message}` }, 500);
  }
});

// ==================== HEALTH CHECK ====================

app.get('/make-server-148a8522/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== DATABASE DIAGNOSTICS ====================

// Check database status and RLS policies
app.get('/make-server-148a8522/diagnostics/database', async (c) => {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    const supabase = getAdminClient();

    // Check 1: Can we query the videos table?
    try {
      const { data, error } = await supabase.from('videos').select('id').limit(1);
      results.checks.tableExists = !error;
      results.checks.tableError = error?.message || null;
      results.checks.videoCount = data?.length || 0;
    } catch (err: any) {
      results.checks.tableExists = false;
      results.checks.tableError = err.message;
    }

    // Check 2: Can we insert a test row? (then delete it)
    try {
      const testVideo = {
        id: 'test_diagnostic_delete_me',
        title: 'Test Video',
        description: 'Diagnostic test',
        creator: 'Test',
        creator_id: 'test',
        video_url: 'https://test.com/test.mp4',
        video_path: 'test/path',
        category: 'short',
      };

      const { error: insertError } = await supabase.from('videos').insert(testVideo);
      
      if (insertError) {
        results.checks.canInsert = false;
        results.checks.insertError = insertError.message;
        results.checks.rlsIssue = insertError.message.includes('row-level security');
      } else {
        results.checks.canInsert = true;
        // Clean up test video
        await supabase.from('videos').delete().eq('id', 'test_diagnostic_delete_me');
      }
    } catch (err: any) {
      results.checks.canInsert = false;
      results.checks.insertError = err.message;
    }

    // Check 3: Environment variables
    results.checks.hasServiceRoleKey = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    results.checks.hasAnonKey = !!Deno.env.get('SUPABASE_ANON_KEY');
    results.checks.hasUrl = !!Deno.env.get('SUPABASE_URL');

    // Overall status
    results.status = results.checks.tableExists && results.checks.canInsert ? 'healthy' : 'issues_detected';

    // Recommendations
    results.recommendations = [];
    if (!results.checks.tableExists) {
      results.recommendations.push('Run migration: /supabase/migrations/001_create_videos_table.sql');
    }
    if (results.checks.rlsIssue) {
      results.recommendations.push('Fix RLS: Run /supabase/FIX_RLS_MANUAL.sql in Supabase Dashboard');
      results.recommendations.push('See /supabase/README_FIX_RLS.md for detailed instructions');
    }

    return c.json(results);
  } catch (error: any) {
    return c.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    }, 500);
  }
});

console.log('🚀 Dorphin backend server starting...');
Deno.serve(app.fetch);