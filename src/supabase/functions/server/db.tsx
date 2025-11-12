import { createClient } from 'npm:@supabase/supabase-js@2';

// Get admin client for database operations
// The service role key should bypass RLS automatically, but we'll configure it explicitly
const getAdminClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  }
);

// ==================== VIDEO OPERATIONS ====================

export const videoDb = {
  // Create a new video
  async create(video: any) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('videos')
      .insert(video)
      .select()
      .single();

    if (error) {
      console.error('Database error creating video:', error);
      throw new Error(`Failed to create video: ${error.message}`);
    }

    return data;
  },

  // Get video by ID
  async getById(videoId: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Database error getting video:', error);
      throw new Error(`Failed to get video: ${error.message}`);
    }

    return data;
  },

  // Get all videos with pagination
  async getAll(category?: 'short' | 'long' | 'all', limit = 50, offset = 0) {
    const supabase = getAdminClient();
    let query = supabase
      .from('videos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error getting videos:', error);
      throw new Error(`Failed to get videos: ${error.message}`);
    }

    return { videos: data || [], total: count || 0 };
  },

  // Search videos by title or description
  async search(searchQuery: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error searching videos:', error);
      throw new Error(`Failed to search videos: ${error.message}`);
    }

    return data || [];
  },

  // Get videos by creator
  async getByCreator(creatorId: string, limit = 50, offset = 0) {
    const supabase = getAdminClient();
    const { data, error, count } = await supabase
      .from('videos')
      .select('*', { count: 'exact' })
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error getting user videos:', error);
      throw new Error(`Failed to get user videos: ${error.message}`);
    }

    return { videos: data || [], total: count || 0 };
  },

  // Delete video
  async delete(videoId: string) {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      console.error('Database error deleting video:', error);
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  },

  // Increment view count
  async incrementViews(videoId: string) {
    const supabase = getAdminClient();
    const { error } = await supabase.rpc('increment_video_views', {
      video_id: videoId
    });

    if (error) {
      // Fallback: update manually
      const { error: updateError } = await supabase
        .from('videos')
        .update({ views: supabase.raw('views + 1') })
        .eq('id', videoId);

      if (updateError) {
        console.error('Database error incrementing views:', updateError);
      }
    }
  },
};

// ==================== REACTION OPERATIONS ====================

export const reactionDb = {
  // Add reaction (like)
  async add(videoId: string, userId: string) {
    const supabase = getAdminClient();
    
    // Insert reaction
    const { error: insertError } = await supabase
      .from('video_reactions')
      .insert({ video_id: videoId, user_id: userId });

    if (insertError) {
      console.error('Database error adding reaction:', insertError);
      throw new Error(`Failed to add reaction: ${insertError.message}`);
    }

    // Increment likes count on video
    const { error: updateError } = await supabase
      .from('videos')
      .update({ likes: supabase.raw('likes + 1') })
      .eq('id', videoId);

    if (updateError) {
      console.error('Database error updating likes count:', updateError);
    }
  },

  // Remove reaction (unlike)
  async remove(videoId: string, userId: string) {
    const supabase = getAdminClient();
    
    // Delete reaction
    const { error: deleteError } = await supabase
      .from('video_reactions')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Database error removing reaction:', deleteError);
      throw new Error(`Failed to remove reaction: ${deleteError.message}`);
    }

    // Decrement likes count on video
    const { error: updateError } = await supabase
      .from('videos')
      .update({ likes: supabase.raw('GREATEST(likes - 1, 0)') })
      .eq('id', videoId);

    if (updateError) {
      console.error('Database error updating likes count:', updateError);
    }
  },

  // Check if user has reacted to video
  async check(videoId: string, userId: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('video_reactions')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error checking reaction:', error);
      return false;
    }

    return !!data;
  },

  // Get reactions for video
  async getForVideo(videoId: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('video_reactions')
      .select('user_id')
      .eq('video_id', videoId);

    if (error) {
      console.error('Database error getting reactions:', error);
      return [];
    }

    return data || [];
  },
};

// ==================== COMMENT OPERATIONS ====================

export const commentDb = {
  // Add comment
  async add(comment: any) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('video_comments')
      .insert(comment)
      .select()
      .single();

    if (error) {
      console.error('Database error adding comment:', error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }

    // Increment comments count on video
    const { error: updateError } = await supabase
      .from('videos')
      .update({ comments: supabase.raw('comments + 1') })
      .eq('id', comment.video_id);

    if (updateError) {
      console.error('Database error updating comments count:', updateError);
    }

    return data;
  },

  // Get comments for video
  async getForVideo(videoId: string, limit = 50, offset = 0) {
    const supabase = getAdminClient();
    const { data, error, count } = await supabase
      .from('video_comments')
      .select('*', { count: 'exact' })
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error getting comments:', error);
      throw new Error(`Failed to get comments: ${error.message}`);
    }

    return { comments: data || [], total: count || 0 };
  },
};

// ==================== FOLLOW OPERATIONS ====================

export const followDb = {
  // Follow user
  async add(followerId: string, followingId: string) {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from('user_follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      console.error('Database error adding follow:', error);
      throw new Error(`Failed to follow user: ${error.message}`);
    }
  },

  // Unfollow user
  async remove(followerId: string, followingId: string) {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Database error removing follow:', error);
      throw new Error(`Failed to unfollow user: ${error.message}`);
    }
  },

  // Check if following
  async check(followerId: string, followingId: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error checking follow:', error);
      return false;
    }

    return !!data;
  },

  // Get followers
  async getFollowers(userId: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', userId);

    if (error) {
      console.error('Database error getting followers:', error);
      return [];
    }

    return data || [];
  },

  // Get following
  async getFollowing(userId: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (error) {
      console.error('Database error getting following:', error);
      return [];
    }

    return data || [];
  },
};