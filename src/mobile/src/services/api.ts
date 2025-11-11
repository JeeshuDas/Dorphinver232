/**
 * API Service for React Native Mobile App
 * Connects mobile app to Dorphin backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api/v1'; // Change for production

const TOKEN_KEY = '@dorphin_token';

// Token management
let authToken: string | null = null;

export const setAuthToken = async (token: string | null) => {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (!authToken) {
    authToken = await AsyncStorage.getItem(TOKEN_KEY);
  }
  return authToken;
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  signup: async (userData: {
    email: string;
    password: string;
    displayName: string;
    username?: string;
  }) => {
    const response = await apiRequest<{
      user: any;
      token: string;
      refreshToken: string;
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    await setAuthToken(response.token);
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest<{
      user: any;
      token: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    await setAuthToken(response.token);
    return response;
  },

  logout: async () => {
    await setAuthToken(null);
  },

  getMe: async () => {
    return apiRequest<{ user: any }>('/auth/me');
  },

  updateProfile: async (profileData: {
    displayName?: string;
    username?: string;
    bio?: string;
    avatar?: string;
  }) => {
    return apiRequest<{ user: any }>('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Video API
export const videoAPI = {
  getFeed: async (params: {
    page?: number;
    limit?: number;
    category?: 'short' | 'long';
  } = {}) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest<{
      videos: any[];
      pagination: any;
    }>(`/videos/feed?${queryParams}`);
  },

  getVideo: async (id: string) => {
    return apiRequest<{ video: any }>(`/videos/${id}`);
  },

  uploadVideo: async (formData: FormData) => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data.data;
  },

  searchVideos: async (query: string, params: any = {}) => {
    const queryParams = new URLSearchParams({ q: query, ...params }).toString();
    return apiRequest<{
      videos: any[];
      pagination: any;
    }>(`/videos/search?${queryParams}`);
  },

  getTrending: async (category?: 'short' | 'long') => {
    const query = category ? `?category=${category}` : '';
    return apiRequest<{ videos: any[] }>(`/videos/trending${query}`);
  },

  getUserVideos: async (userId: string, page = 1) => {
    return apiRequest<{
      videos: any[];
      pagination: any;
    }>(`/videos/user/${userId}?page=${page}`);
  },

  recordView: async (videoId: string, viewData: {
    watchDuration: number;
    completionPercentage: number;
    sessionId?: string;
    deviceType?: string;
    platform?: string;
  }) => {
    return apiRequest(`/videos/${videoId}/view`, {
      method: 'POST',
      body: JSON.stringify(viewData),
    });
  },

  deleteVideo: async (videoId: string) => {
    return apiRequest(`/videos/${videoId}`, {
      method: 'DELETE',
    });
  },
};

// Comment API
export const commentAPI = {
  getComments: async (videoId: string, page = 1) => {
    return apiRequest<{
      comments: any[];
      pagination: any;
    }>(`/comments/${videoId}?page=${page}`);
  },

  getReplies: async (commentId: string, page = 1) => {
    return apiRequest<{
      replies: any[];
      pagination: any;
    }>(`/comments/${commentId}/replies?page=${page}`);
  },

  createComment: async (videoId: string, data: {
    text: string;
    parentComment?: string;
  }) => {
    return apiRequest<{ comment: any }>(`/comments/${videoId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteComment: async (commentId: string) => {
    return apiRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// Reaction API
export const reactionAPI = {
  toggleVideoLike: async (videoId: string) => {
    return apiRequest<{ liked: boolean; likes: number }>(`/reactions/${videoId}`, {
      method: 'POST',
    });
  },

  toggleCommentLike: async (commentId: string) => {
    return apiRequest<{ liked: boolean; likes: number }>(`/reactions/comment/${commentId}`, {
      method: 'POST',
    });
  },

  getVideoLikeStatus: async (videoId: string) => {
    return apiRequest<{ liked: boolean }>(`/reactions/video/${videoId}/status`);
  },

  getLikedVideos: async (page = 1) => {
    return apiRequest<{
      videos: any[];
      pagination: any;
    }>(`/reactions/user/liked-videos?page=${page}`);
  },
};

// Follow API
export const followAPI = {
  toggleFollow: async (creatorId: string) => {
    return apiRequest<{ following: boolean }>(`/follow/${creatorId}`, {
      method: 'POST',
    });
  },

  getFollowStatus: async (userId: string) => {
    return apiRequest<{ following: boolean }>(`/follow/${userId}/status`);
  },

  getFollowers: async (userId: string, page = 1) => {
    return apiRequest<{
      followers: any[];
      pagination: any;
    }>(`/follow/${userId}/followers?page=${page}`);
  },

  getFollowing: async (userId: string, page = 1) => {
    return apiRequest<{
      following: any[];
      pagination: any;
    }>(`/follow/${userId}/following?page=${page}`);
  },

  getFollowingFeed: async (page = 1) => {
    return apiRequest<{
      videos: any[];
      pagination: any;
    }>(`/follow/feed/following?page=${page}`);
  },

  getSuggestions: async (limit = 10) => {
    return apiRequest<{ suggestions: any[] }>(`/follow/suggestions/users?limit=${limit}`);
  },
};

// Notification API
export const notificationAPI = {
  getNotifications: async (page = 1) => {
    return apiRequest<{
      notifications: any[];
      unreadCount: number;
      pagination: any;
    }>(`/notifications?page=${page}`);
  },

  getUnreadCount: async () => {
    return apiRequest<{ count: number }>('/notifications/unread-count');
  },

  markAsRead: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PUT',
    });
  },

  deleteNotification: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// User API
export const userAPI = {
  getUserProfile: async (userId: string) => {
    return apiRequest<{ user: any; isFollowing: boolean }>(`/users/${userId}`);
  },

  getUserByUsername: async (username: string) => {
    return apiRequest<{ user: any; isFollowing: boolean }>(`/users/username/${username}`);
  },

  getUserAnalytics: async (userId: string) => {
    return apiRequest<{ analytics: any }>(`/users/${userId}/analytics`);
  },

  searchUsers: async (query: string, page = 1) => {
    return apiRequest<{
      users: any[];
      pagination: any;
    }>(`/users/search?q=${query}&page=${page}`);
  },

  getLeaderboard: async (sortBy: 'followers' | 'views' | 'likes' = 'followers') => {
    return apiRequest<{ users: any[] }>(`/users/leaderboard?sortBy=${sortBy}`);
  },
};

export default {
  auth: authAPI,
  video: videoAPI,
  comment: commentAPI,
  reaction: reactionAPI,
  follow: followAPI,
  notification: notificationAPI,
  user: userAPI,
};
