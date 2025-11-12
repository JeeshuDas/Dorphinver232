import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Video } from '../types';
import { createClient } from '../utils/supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-148a8522`;

// Get auth token from localStorage
const getAuthToken = async (): Promise<string | null> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      // Don't log warning - this is normal for unauthenticated requests
      return null;
    }
    
    console.log('✅ Access token retrieved successfully');
    return session.access_token;
  } catch (e) {
    console.error('❌ Error getting auth token:', e);
  }
  return null;
};

// API request helper
const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {},
  requiresAuth = false,
  timeoutMs = 30000 // Default 30 seconds
): Promise<any> => {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Always add Authorization header - use access token if available, otherwise use anon key
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Use public anon key for unauthenticated requests (Supabase Edge Functions require this)
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  // Don't add Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    console.log(`📡 API Request: ${endpoint}`);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      console.error(`❌ API Error [${endpoint}]:`, data);
      throw new Error(data?.error || data?.message || 'API request failed');
    }

    console.log(`✅ API Success [${endpoint}]:`, data);
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`⏱️ API Timeout [${endpoint}]: Request took too long`);
      throw new Error('Request timeout. Please check your connection and try again.');
    }
    console.error(`❌ API Request Failed [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== AUTH API ====================

export const authApi = {
  signup: async (email: string, password: string, username: string, displayName?: string) => {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, displayName }),
    }, false);
    
    // Store session in Supabase client
    if (response.user) {
      // For signup, we need to sign in to get session
      const signInResponse = await authApi.signin(email, password);
      return signInResponse;
    }
    
    return response;
  },

  signin: async (email: string, password: string) => {
    console.log('🔐 [SIGNIN] Starting sign-in process for:', email);
    
    try {
      const response = await apiRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, false);

      console.log('✅ [SIGNIN] Backend response received:', response);

      // Set session in Supabase client
      if (response.session) {
        console.log('🔑 [SIGNIN] Setting session in Supabase client...');
        const supabase = createClient();
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: response.session.access_token,
            refresh_token: response.session.refresh_token,
          });
          
          if (error) {
            console.error('❌ [SIGNIN] Error setting session:', error);
            throw new Error(`Failed to set session: ${error.message}`);
          }
          
          console.log('✅ [SIGNIN] Session stored successfully:', data);
        } catch (sessionError: any) {
          console.error('❌ [SIGNIN] Session storage error:', sessionError);
          throw new Error(`Session storage failed: ${sessionError.message}`);
        }
      } else {
        console.warn('⚠️ [SIGNIN] No session in response:', response);
      }

      console.log('✅ [SIGNIN] Sign-in complete, returning response');
      return response;
    } catch (error: any) {
      console.error('❌ [SIGNIN] Sign-in failed:', error);
      throw error;
    }
  },

  signInWithOAuth: async (provider: 'google' | 'apple') => {
    const response = await apiRequest('/auth/oauth', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }, false);

    if (response.url) {
      window.location.href = response.url;
    }

    return response;
  },

  signout: async () => {
    const supabase = createClient();
    
    try {
      await apiRequest('/auth/signout', {
        method: 'POST',
      }, true);
    } catch (error) {
      // Ignore errors - token might be expired or invalid
      console.warn('⚠️ API: Signout request failed (expected if token expired):', error);
    } finally {
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      
      console.log('✅ Session cleared');
    }
  },

  getCurrentUser: async () => {
    const response = await apiRequest('/auth/me', {
      method: 'GET',
    }, true);
    return response.user;
  },

  refreshSession: async (refresh_token: string) => {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }, false);

    // Store new tokens
    if (response.session) {
      localStorage.setItem('access_token', response.session.access_token);
      localStorage.setItem('refresh_token', response.session.refresh_token);
      localStorage.setItem('expires_at', response.session.expires_at.toString());
    }

    return response;
  },

  updateProfile: async (updates: Partial<User>) => {
    const response = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, true);
    return response.user;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiRequest('/auth/upload-avatar', {
      method: 'POST',
      body: formData,
    }, true);

    return response;
  },
};

// ==================== USER API ====================

export const userApi = {
  async getProfile(userId: string) {
    const data = await apiRequest(`/users/${userId}`);
    return data.user;
  },

  async updateProfile(updates: any) {
    const data = await apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, true);
    return data.user;
  },

  async getUserVideos(userId: string) {
    const data = await apiRequest(`/users/${userId}/videos`);
    return data.videos;
  },

  async followUser(userId: string) {
    const data = await apiRequest(`/users/${userId}/follow`, {
      method: 'POST',
    }, true);
    return data;
  },

  async checkFollowing(userId: string) {
    const data = await apiRequest(`/users/${userId}/following`, {}, true);
    return data.following;
  },

  async getFollowers(userId: string) {
    const data = await apiRequest(`/users/${userId}/followers`);
    return data.followers;
  },
};

// ==================== VIDEO API ====================

export const videoApi = {
  async uploadVideo(
    videoFile: File,
    thumbnailFile: File | null,
    metadata: {
      title: string;
      description?: string;
      category: 'short' | 'long';
      shortCategory?: string;
      duration: number;
    }
  ) {
    console.log('📹 Starting video upload...');
    console.log('📦 Video file size:', (videoFile.size / (1024 * 1024)).toFixed(2), 'MB');
    console.log('📦 Metadata:', metadata);
    
    const formData = new FormData();
    formData.append('video', videoFile);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
      console.log('🖼️ Thumbnail size:', (thumbnailFile.size / (1024 * 1024)).toFixed(2), 'MB');
    }
    formData.append('title', metadata.title);
    formData.append('description', metadata.description || '');
    formData.append('category', metadata.category);
    if (metadata.shortCategory) {
      formData.append('shortCategory', metadata.shortCategory);
    }
    formData.append('duration', metadata.duration.toString());

    console.log('🚀 Sending upload request to backend...');
    
    try {
      // Use 5 minute timeout for video uploads (large files)
      const data = await apiRequest('/videos/upload', {
        method: 'POST',
        body: formData,
      }, true, 300000); // 5 minutes
      
      console.log('✅ Video upload completed successfully!');
      return data.video;
    } catch (error) {
      console.error('❌ Video upload failed:', error);
      throw error;
    }
  },

  async getFeed(category: 'all' | 'short' | 'long' = 'all', limit = 20, offset = 0) {
    const params = new URLSearchParams({
      category,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    const data = await apiRequest(`/videos/feed?${params}`);
    return data;
  },

  async getVideo(videoId: string) {
    const data = await apiRequest(`/videos/${videoId}`);
    return data.video;
  },

  async deleteVideo(videoId: string) {
    await apiRequest(`/videos/${videoId}`, {
      method: 'DELETE',
    }, true);
  },

  async likeVideo(videoId: string) {
    const data = await apiRequest(`/videos/${videoId}/like`, {
      method: 'POST',
    }, true);
    return data;
  },

  async checkLiked(videoId: string) {
    const data = await apiRequest(`/videos/${videoId}/liked`, {}, true);
    return data.liked;
  },

  async searchVideos(query: string) {
    if (!query || query.trim() === '') {
      return { videos: [] };
    }

    const params = new URLSearchParams({
      q: query.trim(),
    });
    
    console.log('🔍 Searching videos with query:', query);
    const data = await apiRequest(`/videos/search?${params}`);
    console.log('✅ Search results:', data);
    return data;
  },
};

// ==================== COMMENT API ====================

export const commentApi = {
  async addComment(videoId: string, text: string) {
    const data = await apiRequest(`/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }, true);
    return data.comment;
  },

  async getComments(videoId: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    const data = await apiRequest(`/videos/${videoId}/comments?${params}`);
    return data;
  },
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  const data = await apiRequest('/health');
  return data;
};

export default {
  auth: authApi,
  user: userApi,
  video: videoApi,
  comment: commentApi,
  healthCheck,
};