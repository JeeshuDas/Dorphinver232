import { Video, User } from '../types';

// Local backend configuration
const LOCAL_BACKEND_URL = 'http://localhost:5000';

// In-memory storage for videos metadata (since local backend only stores files)
let videosStore: Video[] = [];
let videoIdCounter = 1;

// Helper to get current demo user
const getDemoUser = (): User => ({
  id: 'demo-user-id',
  username: 'demo_user',
  displayName: 'Demo User',
  email: 'demo@dorphin.app',
  avatar: '#8b5cf6',
  bio: 'Exploring amazing content on Dorphin',
  followers: 0,
  following: 0,
  isVerified: false,
  createdAt: new Date().toISOString(),
});

// Helper to create video metadata
const createVideoMetadata = (
  fileUrl: string,
  filename: string,
  title: string,
  description: string,
  category: 'short' | 'long',
  shortCategory?: string,
  duration?: number
): Video => {
  const user = getDemoUser();
  
  return {
    id: `video-${videoIdCounter++}`,
    title,
    description,
    videoUrl: fileUrl,
    thumbnailUrl: fileUrl, // Use video URL as thumbnail for now
    creator: user,
    creatorId: user.id,
    category,
    shortCategory: shortCategory || 'entertainment',
    duration: duration || 0,
    views: 0,
    likes: 0,
    comments: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
  };
};

// ==================== LOCAL BACKEND API ====================

export const localBackendApi = {
  /**
   * Upload video to local backend
   */
  async uploadVideo(
    videoFile: File,
    metadata: {
      title: string;
      description?: string;
      category: 'short' | 'long';
      shortCategory?: string;
      duration?: number;
    }
  ): Promise<Video> {
    console.log('📹 [LOCAL] Starting video upload to local backend...');
    console.log('📦 [LOCAL] Video file size:', (videoFile.size / (1024 * 1024)).toFixed(2), 'MB');
    console.log('📦 [LOCAL] Metadata:', metadata);

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await fetch(`${LOCAL_BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('✅ [LOCAL] Video uploaded successfully:', data);

      // Create video metadata and store it
      const video = createVideoMetadata(
        data.fileUrl,
        data.filename,
        metadata.title,
        metadata.description || '',
        metadata.category,
        metadata.shortCategory,
        metadata.duration
      );

      videosStore.push(video);
      console.log('✅ [LOCAL] Video metadata stored, total videos:', videosStore.length);

      return video;
    } catch (error: any) {
      console.error('❌ [LOCAL] Upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  /**
   * Get all videos
   */
  async getVideos(): Promise<Video[]> {
    console.log('📋 [LOCAL] Fetching all videos from store');
    return [...videosStore].reverse(); // Newest first
  },

  /**
   * Get videos by category
   */
  async getVideosByCategory(category: 'short' | 'long' | 'all'): Promise<Video[]> {
    console.log('📋 [LOCAL] Fetching videos by category:', category);
    
    if (category === 'all') {
      return [...videosStore].reverse();
    }
    
    return videosStore.filter(v => v.category === category).reverse();
  },

  /**
   * Get single video by ID
   */
  async getVideo(videoId: string): Promise<Video | null> {
    console.log('📋 [LOCAL] Fetching video:', videoId);
    return videosStore.find(v => v.id === videoId) || null;
  },

  /**
   * Search videos
   */
  async searchVideos(query: string): Promise<Video[]> {
    console.log('🔍 [LOCAL] Searching videos:', query);
    
    if (!query || query.trim() === '') {
      return [];
    }

    const searchTerm = query.toLowerCase();
    return videosStore.filter(video => 
      video.title.toLowerCase().includes(searchTerm) ||
      video.description.toLowerCase().includes(searchTerm)
    ).reverse();
  },

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<void> {
    console.log('🗑️  [LOCAL] Deleting video:', videoId);
    
    const video = videosStore.find(v => v.id === videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    // Extract filename from URL
    const filename = video.videoUrl.split('/').pop();
    if (!filename) {
      throw new Error('Invalid video URL');
    }

    try {
      // Delete from local backend
      const response = await fetch(`${LOCAL_BACKEND_URL}/videos/${filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      // Remove from store
      videosStore = videosStore.filter(v => v.id !== videoId);
      console.log('✅ [LOCAL] Video deleted successfully');
    } catch (error: any) {
      console.error('❌ [LOCAL] Delete failed:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  },

  /**
   * Like/unlike video
   */
  async toggleLike(videoId: string): Promise<Video> {
    console.log('❤️  [LOCAL] Toggling like for video:', videoId);
    
    const video = videosStore.find(v => v.id === videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    video.isLiked = !video.isLiked;
    video.likes += video.isLiked ? 1 : -1;
    
    return video;
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${LOCAL_BACKEND_URL}/health`);
      const data = await response.json();
      console.log('✅ [LOCAL] Backend health check:', data);
      return data.status === 'running';
    } catch (error) {
      console.error('❌ [LOCAL] Backend health check failed:', error);
      return false;
    }
  },

  /**
   * Get storage info
   */
  async getStorageInfo(): Promise<any> {
    try {
      const response = await fetch(`${LOCAL_BACKEND_URL}/storage-info`);
      const data = await response.json();
      console.log('💾 [LOCAL] Storage info:', data);
      return data;
    } catch (error) {
      console.error('❌ [LOCAL] Failed to get storage info:', error);
      throw error;
    }
  },

  /**
   * Sync with backend files
   * This fetches the actual files from backend and syncs metadata
   */
  async syncWithBackend(): Promise<void> {
    console.log('🔄 [LOCAL] Syncing with backend files...');
    
    try {
      const response = await fetch(`${LOCAL_BACKEND_URL}/videos`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos from backend');
      }

      const data = await response.json();
      const backendFiles = data.videos || [];

      console.log(`📋 [LOCAL] Found ${backendFiles.length} files in backend`);

      // Create metadata for any files that don't have it
      backendFiles.forEach((file: any) => {
        const existingVideo = videosStore.find(v => v.videoUrl === file.fileUrl);
        
        if (!existingVideo) {
          // Create metadata for files without it
          const video = createVideoMetadata(
            file.fileUrl,
            file.filename,
            file.filename.split('_')[0] || 'Untitled Video',
            'Uploaded video',
            'short',
            'entertainment',
            0
          );
          videosStore.push(video);
        }
      });

      console.log('✅ [LOCAL] Sync complete, total videos:', videosStore.length);
    } catch (error: any) {
      console.error('❌ [LOCAL] Sync failed:', error);
      throw error;
    }
  },

  /**
   * Initialize - Load from localStorage and sync with backend
   */
  async initialize(): Promise<void> {
    console.log('🚀 [LOCAL] Initializing local backend API...');
    
    // Load from localStorage if available
    try {
      const stored = localStorage.getItem('dorphin_videos');
      if (stored) {
        videosStore = JSON.parse(stored);
        console.log('📦 [LOCAL] Loaded', videosStore.length, 'videos from localStorage');
      }
    } catch (error) {
      console.warn('⚠️ [LOCAL] Failed to load from localStorage:', error);
    }

    // Check backend health
    const isHealthy = await this.healthCheck();
    if (isHealthy) {
      // Sync with backend files
      await this.syncWithBackend();
      
      // Save to localStorage
      this.saveToLocalStorage();
    } else {
      console.warn('⚠️ [LOCAL] Backend not available, using stored data only');
    }
  },

  /**
   * Save videos to localStorage
   */
  saveToLocalStorage(): void {
    try {
      localStorage.setItem('dorphin_videos', JSON.stringify(videosStore));
      console.log('💾 [LOCAL] Saved videos to localStorage');
    } catch (error) {
      console.warn('⚠️ [LOCAL] Failed to save to localStorage:', error);
    }
  },
};

export default localBackendApi;
