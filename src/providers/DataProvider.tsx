import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

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

  // Initialize with mock data on mount
  useEffect(() => {
    console.log('🎭 Using mock data only (no backend)');
    console.log('✅ Loaded mock videos');
    setVideos(mockVideos.filter(v => v.category === 'long'));
    setShorts(mockVideos.filter(v => v.category === 'short'));
  }, []);

  // Fetch videos (mock - just return existing data)
  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      setVideos(mockVideos.filter(v => v.category === 'long'));
      setError(null);
    } catch (err: any) {
      console.error('Error loading videos:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch shorts (mock - just return existing data)
  const fetchShorts = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      setShorts(mockVideos.filter(v => v.category === 'short'));
      setError(null);
    } catch (err: any) {
      console.error('Error loading shorts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    setIsRefreshing(true);
    await fetchVideos();
    await fetchShorts();
    setIsRefreshing(false);
  };

  // Search videos (mock - search in mock data)
  const searchVideos = async (query: string) => {
    if (query.trim() === '') {
      clearSearch();
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
      
      const lowerQuery = query.toLowerCase();
      const results = mockVideos.filter(video => 
        video.title.toLowerCase().includes(lowerQuery) ||
        video.description?.toLowerCase().includes(lowerQuery) ||
        video.creator.toLowerCase().includes(lowerQuery)
      );
      
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

  // Like a video (mock - just update local state)
  const likeVideo = async (videoId: string) => {
    try {
      // Update local state - toggle like
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, likes: v.likes + 1 } : v
      ));
      setShorts(prev => prev.map(v => 
        v.id === videoId ? { ...v, likes: v.likes + 1 } : v
      ));
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
    isBackendConnected: false,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};