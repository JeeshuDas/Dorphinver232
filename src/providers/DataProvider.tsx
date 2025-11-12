import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';
import { localBackendApi } from '../services/localBackendApi';
import { useAuth } from '../contexts/AuthContext';
import { logBackendInstructions, logBackendConnected } from '../utils/consoleHelper';

interface DataContextType {
  videos: Video[];
  shorts: Video[];
  isLoading: boolean;
  isRefreshing: boolean;
  isSearching: boolean;
  searchResults: Video[];
  error: string | null;
  refetchVideos: () => Promise<void>;
  refetchShorts: () => Promise<void>;
  refreshAll: () => Promise<void>;
  searchVideos: (query: string) => Promise<void>;
  clearSearch: () => void;
  likeVideo: (videoId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  followedUsers: Set<string>;
  isBackendConnected: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [backendInitialized, setBackendInitialized] = useState(false);

  // Initialize local backend on mount
  useEffect(() => {
    const initBackend = async () => {
      try {
        console.log('🚀 Initializing local backend connection...');
        await localBackendApi.initialize();
        setBackendInitialized(true);
        console.log('✅ Local backend initialized successfully');
        logBackendConnected();
        
        // Fetch initial data
        await fetchVideos();
        await fetchShorts();
      } catch (err: any) {
        console.error('❌ Failed to initialize local backend:', err);
        logBackendInstructions();
        // Fallback to mock data
        setVideos(mockVideos.filter(v => v.category === 'long'));
        setShorts(mockVideos.filter(v => v.category === 'short'));
        setBackendInitialized(false);
      }
    };
    
    initBackend();
  }, []);

  // Fetch videos from local backend
  const fetchVideos = async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const allVideos = await localBackendApi.getVideosByCategory('long');
      console.log('📹 [DataProvider] Fetched', allVideos.length, 'long videos');
      
      if (allVideos.length > 0) {
        setVideos(allVideos);
      } else {
        // Fallback to mock data if no backend videos
        console.log('ℹ️ No videos in backend, using mock data');
        setVideos(mockVideos.filter(v => v.category === 'long'));
      }
    } catch (err: any) {
      console.error('❌ Error fetching videos:', err);
      setError(err.message);
      // Fallback to mock data on error
      setVideos(mockVideos.filter(v => v.category === 'long'));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Fetch shorts from local backend
  const fetchShorts = async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const allShorts = await localBackendApi.getVideosByCategory('short');
      console.log('📱 [DataProvider] Fetched', allShorts.length, 'shorts');
      
      if (allShorts.length > 0) {
        setShorts(allShorts);
      } else {
        // Fallback to mock data if no backend shorts
        console.log('ℹ️ No shorts in backend, using mock data');
        setShorts(mockVideos.filter(v => v.category === 'short'));
      }
    } catch (err: any) {
      console.error('❌ Error fetching shorts:', err);
      setError(err.message);
      // Fallback to mock data on error
      setShorts(mockVideos.filter(v => v.category === 'short'));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    setIsRefreshing(true);
    
    // Re-sync with backend
    try {
      await localBackendApi.syncWithBackend();
    } catch (err) {
      console.error('❌ Failed to sync with backend:', err);
    }
    
    await fetchVideos(false);
    await fetchShorts(false);
    setIsRefreshing(false);
  };

  // Search videos
  const searchVideos = async (query: string) => {
    if (query.trim() === '') {
      clearSearch();
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const results = await localBackendApi.searchVideos(query);
      console.log('🔍 [DataProvider] Search results:', results.length, 'videos');
      setSearchResults(results);
    } catch (err: any) {
      console.error('❌ Error searching videos:', err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchResults([]);
  };

  // Like a video
  const likeVideo = async (videoId: string) => {
    try {
      const updatedVideo = await localBackendApi.toggleLike(videoId);
      
      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === videoId ? updatedVideo : v
      ));
      setShorts(prev => prev.map(v => 
        v.id === videoId ? updatedVideo : v
      ));
      
      // Save to localStorage
      localBackendApi.saveToLocalStorage();
    } catch (err: any) {
      console.error('❌ Error liking video:', err);
      setError(err.message);
    }
  };

  // Follow a user (local only)
  const followUser = async (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Check if following a user
  const isFollowing = (userId: string) => {
    return followedUsers.has(userId);
  };

  const value = {
    videos,
    shorts,
    isLoading,
    isRefreshing,
    isSearching,
    searchResults,
    error,
    refetchVideos: fetchVideos,
    refetchShorts: fetchShorts,
    refreshAll,
    searchVideos,
    clearSearch,
    likeVideo,
    followUser,
    isFollowing,
    followedUsers,
    isBackendConnected: backendInitialized,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};