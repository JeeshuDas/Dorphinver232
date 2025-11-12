import { useState, useCallback, useEffect } from 'react';
import { followApi } from '../services/followApi';
import { useAuth } from '../contexts/AuthContext';

interface FollowState {
  [userId: string]: boolean;
}

// Global follow state shared across all components
let globalFollowState: FollowState = {};
const listeners = new Set<(state: FollowState) => void>();

// Subscribe to follow state changes
const subscribe = (listener: (state: FollowState) => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Update global follow state and notify all listeners
const updateFollowState = (userId: string, following: boolean) => {
  globalFollowState = { ...globalFollowState, [userId]: following };
  listeners.forEach(listener => listener(globalFollowState));
};

// Get current follow state
const getFollowState = (userId: string): boolean => {
  return globalFollowState[userId] || false;
};

/**
 * Hook for managing follow state globally
 * This ensures that when a user follows/unfollows someone,
 * the state is updated across ALL components in the app
 */
export function useFollow() {
  const { user } = useAuth();
  const [followState, setFollowState] = useState<FollowState>(globalFollowState);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to global follow state changes
  useEffect(() => {
    const unsubscribe = subscribe((newState) => {
      setFollowState(newState);
    });
    return unsubscribe;
  }, []);

  /**
   * Check if current user is following a specific user
   */
  const isFollowing = useCallback((userId: string): boolean => {
    return getFollowState(userId);
  }, []);

  /**
   * Follow a user
   */
  const followUser = useCallback(async (targetUserId: string) => {
    if (!user) {
      console.warn('Cannot follow: user not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    if (user.id === targetUserId) {
      console.warn('Cannot follow yourself');
      return { success: false, error: 'Cannot follow yourself' };
    }

    setIsLoading(true);
    
    // Optimistic update
    updateFollowState(targetUserId, true);

    try {
      const result = await followApi.followUser(targetUserId);
      
      if (result.error) {
        // Revert on error
        updateFollowState(targetUserId, false);
        return { success: false, error: result.error };
      }

      console.log('✅ Followed user:', targetUserId);
      return { success: true, followers: result.followers };
    } catch (error) {
      // Revert on error
      updateFollowState(targetUserId, false);
      console.error('Follow error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Unfollow a user
   */
  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user) {
      console.warn('Cannot unfollow: user not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    if (user.id === targetUserId) {
      console.warn('Cannot unfollow yourself');
      return { success: false, error: 'Cannot unfollow yourself' };
    }

    setIsLoading(true);
    
    // Optimistic update
    updateFollowState(targetUserId, false);

    try {
      const result = await followApi.unfollowUser(targetUserId);
      
      if (result.error) {
        // Revert on error
        updateFollowState(targetUserId, true);
        return { success: false, error: result.error };
      }

      console.log('✅ Unfollowed user:', targetUserId);
      return { success: true, followers: result.followers };
    } catch (error) {
      // Revert on error
      updateFollowState(targetUserId, true);
      console.error('Unfollow error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Toggle follow/unfollow
   */
  const toggleFollow = useCallback(async (targetUserId: string) => {
    const currentlyFollowing = isFollowing(targetUserId);
    
    if (currentlyFollowing) {
      return await unfollowUser(targetUserId);
    } else {
      return await followUser(targetUserId);
    }
  }, [isFollowing, followUser, unfollowUser]);

  /**
   * Load follow status for a specific user
   */
  const loadFollowStatus = useCallback(async (targetUserId: string) => {
    if (!user || user.id === targetUserId) {
      return;
    }

    try {
      const result = await followApi.getFollowStatus(targetUserId);
      if (!result.error) {
        updateFollowState(targetUserId, result.following);
      }
    } catch (error) {
      console.error('Error loading follow status:', error);
    }
  }, [user]);

  /**
   * Load follow statuses for multiple users (batch)
   */
  const loadFollowStatusBatch = useCallback(async (userIds: string[]) => {
    if (!user) {
      return;
    }

    // Filter out current user ID
    const filteredUserIds = userIds.filter(id => id !== user.id);

    if (filteredUserIds.length === 0) {
      return;
    }

    try {
      const result = await followApi.getFollowStatusBatch(filteredUserIds);
      if (!result.error && result.followStatuses) {
        // Update global state with all statuses
        Object.entries(result.followStatuses).forEach(([userId, following]) => {
          updateFollowState(userId, following);
        });
      }
    } catch (error) {
      console.error('Error loading follow statuses:', error);
    }
  }, [user]);

  /**
   * Get followers list for a user
   */
  const getFollowers = useCallback(async (userId: string) => {
    try {
      const result = await followApi.getFollowers(userId);
      if (result.error) {
        console.error('Error getting followers:', result.error);
        return [];
      }
      return result.followers;
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }, []);

  /**
   * Get following list for a user
   */
  const getFollowing = useCallback(async (userId: string) => {
    try {
      const result = await followApi.getFollowing(userId);
      if (result.error) {
        console.error('Error getting following:', result.error);
        return [];
      }
      return result.following;
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }, []);

  return {
    followState,
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    loadFollowStatus,
    loadFollowStatusBatch,
    getFollowers,
    getFollowing,
    isLoading,
  };
}

/**
 * Reset global follow state (useful for logout)
 */
export const resetFollowState = () => {
  globalFollowState = {};
  listeners.forEach(listener => listener(globalFollowState));
};
