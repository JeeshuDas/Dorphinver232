import { projectId, publicAnonKey } from '../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-148a8522`;

// Get auth token (in a real app, this would come from auth context)
// For now, we'll return null since auth is disabled
const getAuthToken = (): string | null => {
  return null;
};

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }
  
  return headers;
};

export const followApi = {
  /**
   * Follow a user
   * @param targetUserId - The ID of the user to follow
   * @returns Promise with follow status
   */
  async followUser(targetUserId: string): Promise<{ following: boolean; followers: number; message?: string; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Follow user failed:', data.error);
        return { following: false, followers: 0, error: data.error };
      }

      console.log('✅ User followed successfully:', targetUserId);
      return data;
    } catch (error) {
      console.error('❌ Follow user error:', error);
      return { following: false, followers: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Unfollow a user
   * @param targetUserId - The ID of the user to unfollow
   * @returns Promise with follow status
   */
  async unfollowUser(targetUserId: string): Promise<{ following: boolean; followers: number; message?: string; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/users/${targetUserId}/follow`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Unfollow user failed:', data.error);
        return { following: true, followers: 0, error: data.error };
      }

      console.log('✅ User unfollowed successfully:', targetUserId);
      return data;
    } catch (error) {
      console.error('❌ Unfollow user error:', error);
      return { following: true, followers: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Toggle follow/unfollow a user (convenience method)
   * @param targetUserId - The ID of the user to toggle follow status
   * @returns Promise with follow status
   */
  async toggleFollow(targetUserId: string): Promise<{ following: boolean; followers: number; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/users/${targetUserId}/toggle-follow`, {
        method: 'POST',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Toggle follow failed:', data.error);
        return { following: false, followers: 0, error: data.error };
      }

      console.log('✅ Follow toggled successfully:', targetUserId, data.following);
      return data;
    } catch (error) {
      console.error('❌ Toggle follow error:', error);
      return { following: false, followers: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Check if current user is following a specific user
   * @param targetUserId - The ID of the user to check
   * @returns Promise with follow status
   */
  async getFollowStatus(targetUserId: string): Promise<{ following: boolean; self?: boolean; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/users/${targetUserId}/following`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Get follow status failed:', data.error);
        return { following: false, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('❌ Get follow status error:', error);
      return { following: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Batch check follow status for multiple users
   * @param userIds - Array of user IDs to check
   * @returns Promise with follow statuses for each user
   */
  async getFollowStatusBatch(userIds: string[]): Promise<{ followStatuses: Record<string, boolean>; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/users/following/batch`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Batch get follow status failed:', data.error);
        return { followStatuses: {}, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('❌ Batch get follow status error:', error);
      return { followStatuses: {}, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Get list of followers for a user
   * @param userId - The ID of the user
   * @returns Promise with list of followers
   */
  async getFollowers(userId: string): Promise<{ followers: any[]; count: number; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/followers`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Get followers failed:', data.error);
        return { followers: [], count: 0, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('❌ Get followers error:', error);
      return { followers: [], count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Get list of users that a user is following
   * @param userId - The ID of the user
   * @returns Promise with list of following users
   */
  async getFollowing(userId: string): Promise<{ following: any[]; count: number; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/following`, {
        method: 'GET',
        headers: getHeaders(),
        
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Get following failed:', data.error);
        return { following: [], count: 0, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('❌ Get following error:', error);
      return { following: [], count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};
